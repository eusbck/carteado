// Salas privadas (código + senha), assentos, escolha de deck, bots e condução da partida.
// O servidor é a autoridade: valida cada resposta no motor e manda a cada conexão só a vista
// do próprio assento (motor/view.ts), nunca o estado inteiro.

import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import { HeuristicBot } from '../bots/heuristico.ts';
import { NIVEL_PADRAO, nivelValido, type NivelBot } from '../bots/niveis.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { shouldAutoPass, type StopSettings } from '../motor/autopass.ts';
import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, GameConfig, Step } from '../motor/types.ts';
import { controllerOf } from '../motor/chars.ts';
import { buildView } from '../motor/view.ts';
import { Pensadores } from './pensadores.ts';
import { NOMES_BOTS } from './nomes.ts';
import type { Banco } from './banco.ts';
import { alvoDesfazer, linhasDesfeitas, reconstruir, type MetaEntrada } from './desfazer.ts';
import { avatarValido } from './avatares.ts';
import { tipoMsg, validarMsg, type EtapaSaguao, type LinhaDesfeita, type Modo, type MsgChat, type MsgCliente, type MsgServidor, type PedidoDesfazer, type Posicoes, type RegraAuxilios, type RegraMulligan, type SalaPublica, type TipoAssento } from './protocolo.ts';

export interface Conexao {
  enviar(m: MsgServidor): void;
  sala: Sala | null;
  assento: number | null;
  /** o token com que esta conexão tomou o assento (ao sentar ou ao retomar); a sala o confere a cada transmissão */
  token?: string | null;
}

export interface Atrasos {
  /** bot faz uma jogada que todos veem (conjurar, atacar…) */
  botAcao: number;
  /** bot passa a prioridade ou responde algo menor */
  botPasse: number;
  /** passe automático de um humano: o mesmo atraso sempre, para não revelar se havia resposta */
  autoPasse: number;
  /** simulações por decisão de todos os bots, no lugar das do nível (testes: bots fracos e rápidos); null = do nível */
  simulacoesBot: number | null;
  /** threads de pensar dos bots, para todas as salas juntas (0: pensam na linha principal, como nos testes) */
  threads: number;
  /** teto de tempo por decisão de todos os bots, no lugar do do nível (testes); null = do nível */
  tempoBot?: number | null;
  /** a partir de quantos ms pensando a mesa avisa "Fulano está pensando…" */
  avisoPensando: number;
  /** quanto tempo os outros têm para aceitar um pedido de desfazer */
  prazoDesfazer: number;
}

export const ATRASOS_PADRAO: Atrasos = { botAcao: 700, botPasse: 90, autoPasse: 60, simulacoesBot: null, prazoDesfazer: 30000, threads: 2, avisoPensando: 1000 };
// testes do servidor: sem atrasos e com bots que pensam pouco (o fluxo da sala é o que importa)
export const SEM_ATRASO: Atrasos = { botAcao: 0, botPasse: 0, autoPasse: 0, simulacoesBot: 3, prazoDesfazer: 30000, threads: 0, avisoPensando: 1000, tempoBot: 300 };

interface Assento {
  tipo: TipoAssento;
  nome: string | null;
  /** nível do bot (fase 9); quem não tem é Intermediário, o bot das fases anteriores */
  nivel?: NivelBot;
  deck: string | null;
  token: string | null;
  paradas: StopSettings;
  /** retrato escolhido pela pessoa (null ou sem valor: o do comandante do deck) */
  avatar?: string | null;
  /** a pessoa saiu da sala no meio da partida: o assento fica com o jogador dela até a partida acabar, e aí vaga */
  saiu?: boolean;
}

interface DadosPartida {
  config: GameConfig;
  deckIds: string[];
  /** a lista de cada assento quando a partida começou: atualizar um deck não muda a partida (que se refaz pela
   * semente e pelas entradas). Salas de antes da importação de decks recebem a lista atual em `restaurar`. */
  listas?: DeckList[];
  checkpoint: Checkpoint | null;
  /** onde cada pessoa arrumou as próprias permanentes (só visual, fora do motor) */
  posicoes?: Posicoes;
}

interface DadosSala {
  codigo: string;
  senha: string;
  modo: Modo;
  estado: SalaPublica['estado'];
  assentos: Assento[];
  anfitriao: number;
  partida: DadosPartida | null;
  mulligan?: RegraMulligan;
  auxilios?: RegraAuxilios;
  /** as últimas mensagens do chat (continuam numa partida nova e depois de reiniciar o servidor) */
  chat?: MsgChat[];
  /** passo do saguão (salas de antes não têm: começam nos lugares) */
  etapa?: EtapaSaguao;
}

interface Pedido {
  de: number;
  /** posição da entrada onde a jogada começa: tudo dali em diante volta */
  alvo: number;
  voltar: Game;
  linhas: LinhaDesfeita[];
  aceitaram: Set<number>;
  faltam: Set<number>;
  prazo: number;
  timer: ReturnType<typeof setTimeout>;
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Paradas de quem senta (fase 9): só no próprio turno. No turno dos outros a mesa anda sozinha; quem quiser
 * responder marca a etapa final dos outros ou "mágicas dos oponentes" na faixa de fases. (Antes paravam também na
 * etapa final de cada oponente e a cada mágica de oponente; na mesa real, que para mesmo sem jogada, parecia que os
 * bots tinham travado.)
 */
export const PARADAS_PADRAO: StopSettings = {
  myTurn: ['main1', 'beginCombat', 'main2'],
  othersTurn: [],
  stopOnOpponentStack: false,
  stopOnOwnStack: false,
  passUntilTurnEnds: null,
};
const paradasPadrao = (): StopSettings => structuredClone(PARADAS_PADRAO);

/** as paradas padrão de antes da fase 9, que ninguém escolheu: as salas antigas passam para as novas */
function paradasAntigas(p: StopSettings): boolean {
  return p.myTurn.join() === 'main1,beginCombat,main2' && p.othersTurn.join() === 'end' && p.stopOnOpponentStack && !p.stopOnOwnStack;
}
const PASSOS: Step[] = ['upkeep', 'draw', 'main1', 'beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat', 'main2', 'end'];

function hashSenha(senha: string): string {
  const sal = randomBytes(16);
  return `${sal.toString('hex')}:${scryptSync(senha, sal, 32).toString('hex')}`;
}
function confereSenha(senha: string, guardada: string): boolean {
  const [sal, hash] = guardada.split(':');
  const h = scryptSync(senha, Buffer.from(sal, 'hex'), 32);
  return timingSafeEqual(h, Buffer.from(hash, 'hex'));
}
const novoToken = () => randomBytes(24).toString('base64url');
/** identificador público da partida: hash curto da semente (a semente refaz os embaralhamentos: fica só no servidor) */
export const idPartida = (semente: string): string => createHash('sha256').update(semente).digest('hex').slice(0, 12);
/** id público de quem ocupa um assento, o autor no chat: hash do token (que continua secreto). Muda quando outra
 * pessoa senta no assento (token novo) e fica o mesmo para quem volta pelo token */
export const idAutor = (token: string | null): string => (token ? createHash('sha256').update(`autor:${token}`).digest('base64url').slice(0, 12) : '');
const limparNome = (s: unknown) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, 24) : '');

/** chat: tamanho de uma mensagem, quantas a sala guarda e o ritmo (no máximo CHAT_RAJADA a cada CHAT_JANELA ms) */
export const CHAT_TAMANHO = 280;
const CHAT_GUARDADAS = 200;
const CHAT_RAJADA = 5;
const CHAT_JANELA = 5000;
// uma linha só: quebras e caracteres de controle viram espaço
const limparChat = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim().slice(0, CHAT_TAMANHO) : '');
const dorme = (ms: number) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

function paradasValidas(p: unknown): StopSettings | null {
  if (!p || typeof p !== 'object') return null;
  const x = p as StopSettings;
  const ok = (l: unknown) => Array.isArray(l) && l.every((s) => PASSOS.includes(s as Step));
  if (!ok(x.myTurn) || !ok(x.othersTurn) || typeof x.stopOnOpponentStack !== 'boolean' || typeof x.stopOnOwnStack !== 'boolean') return null;
  if (x.skipWhenNothing !== undefined && typeof x.skipWhenNothing !== 'boolean') return null;
  return { myTurn: [...x.myTurn], othersTurn: [...x.othersTurn], stopOnOpponentStack: x.stopOnOpponentStack, stopOnOwnStack: x.stopOnOwnStack, passUntilTurnEnds: null, skipWhenNothing: x.skipWhenNothing ?? true };
}

export class Sala {
  d: DadosSala;
  game: Game | null = null;
  conexoes = new Set<Conexao>();
  private bots = new Map<number, HeuristicBot>();
  private rodando = false;
  /** muda quando os bots são recriados (partida nova, retomada, desfazer): respostas pensadas antes não valem */
  private geracao = 0;
  /** bot pensando há mais de um segundo (a mesa mostra "Fulano está pensando…") */
  private pensando: number | null = null;
  private esperandoBot = false;
  private salvas = 0;
  /** de cada entrada da partida: turno e se foi a pessoa (alinhado com game.inputs) */
  private metas: (MetaEntrada | null)[] = [];
  /** estado no começo dos últimos turnos (o desfazer refaz a partida a partir daqui) */
  private cps: Checkpoint[] = [];
  private pedido: Pedido | null = null;
  /** hora das últimas mensagens de chat de cada assento (para o limite de ritmo) */
  private ritmoChat = new Map<number, number[]>();
  /** falhas seguidas do motor na mesma posição das entradas (falha) */
  private falhas = { indice: -1, n: 0 };
  erro: string | null = null;

  private gerente: Gerente;

  constructor(d: DadosSala, gerente: Gerente) { this.d = d; this.gerente = gerente; }

  get codigo(): string { return this.d.codigo; }

  publica(): SalaPublica {
    const conectados = new Set([...this.conexoes].map((c) => c.assento));
    return {
      codigo: this.d.codigo, modo: this.d.modo, estado: this.d.estado, anfitriao: this.d.anfitriao, mulligan: this.d.mulligan ?? 'londres', auxilios: this.d.auxilios ?? 'permitidos',
      partida: this.d.partida ? idPartida(this.d.partida.config.seed) : null, etapa: this.d.etapa ?? 'lugares',
      assentos: this.d.assentos.map((a, i) => ({ indice: i, tipo: a.tipo, nome: a.nome, deck: a.deck, conectado: a.tipo === 'bot' || conectados.has(i), nivel: a.tipo === 'bot' ? a.nivel ?? NIVEL_PADRAO : null, avatar: a.tipo === 'humano' ? a.avatar ?? null : null })),
    };
  }

  salvar(): void { this.gerente.banco.salvarSala(this.d.codigo, this.d); }

  /** manda a cada conexão a sala e, se houver partida, a vista do seu assento */
  transmitir(): void {
    const pub = this.publica();
    for (const c of this.conexoes) {
      if (c.assento === null) continue;
      const token = this.d.assentos[c.assento]?.token ?? null;
      // o assento mudou de dono (vagou, outra pessoa sentou) desde que esta conexão o tomou: ela sai, e nunca recebe o
      // token nem a vista de outra pessoa
      if (!token || c.token !== token) { this.soltar(c); continue; }
      c.enviar({ t: 'sala', sala: pub, voce: c.assento, token: token ?? '', quem: idAutor(token) });
      this.enviarJogo(c);
    }
  }

  enviarJogo(c: Conexao): void {
    if (!this.game || c.assento === null) return;
    const vista = buildView(this.game.g, c.assento, this.game.pending);
    const desfazivel = !this.pedido && !this.game.isOver() && this.alvoDesfazer(c.assento) !== null;
    c.enviar({ t: 'jogo', vista, paradas: this.d.assentos[c.assento].paradas, posicoes: this.posicoesNoCampo(), desfazivel, desfazer: this.pedidoPublico() });
  }

  private get semAuxilios(): boolean { return this.d.auxilios === 'proibidos'; }

  /** sala sem auxílios: ninguém passa sozinho só por não ter jogada (isso entregaria a informação) */
  private paradasEfetivas(a: Assento): StopSettings {
    return this.semAuxilios ? { ...a.paradas, skipWhenNothing: false } : a.paradas;
  }

  /** só as posições de objetos que continuam no campo */
  private posicoesNoCampo(): Posicoes {
    const todas = this.d.partida?.posicoes ?? {};
    const campo = new Set(this.game?.state.zones.battlefield ?? []);
    return Object.fromEntries(Object.entries(todas).filter(([id]) => campo.has(Number(id))));
  }

  // ------------------------------------------------------------------ lobby
  sentar(c: Conexao, nome: string): number | null {
    const i = this.d.assentos.findIndex((a) => a.tipo === 'vazio');
    if (i < 0) return null;
    // sala encerrada com um lugar vago: quem chega vai para o saguão com os outros, sem a vista da partida antiga
    if (this.d.estado === 'fim') this.voltarAoSaguao();
    this.d.assentos[i] = { tipo: 'humano', nome, deck: null, token: novoToken(), paradas: paradasPadrao() };
    // todas as pessoas tinham saído (o anfitrião apontava para um lugar vazio ou para um bot): quem chega conduz
    const anf = this.d.assentos[this.d.anfitriao];
    if (anf?.tipo !== 'humano' || anf.saiu) this.d.anfitriao = i;
    // um bot com o mesmo nome da pessoa ganha outro
    for (const [k, a] of this.d.assentos.entries()) if (a.tipo === 'bot' && a.nome?.toUpperCase() === nome.toUpperCase()) a.nome = this.sortearNome(k);
    this.ligar(c, i);
    return i;
  }

  ligar(c: Conexao, assento: number): void {
    if (c.sala && c.sala !== this) c.sala.desligar(c);
    c.sala = this;
    c.assento = assento;
    c.token = this.d.assentos[assento].token;
    this.conexoes.add(c);
    c.enviar({ t: 'chat', msgs: this.d.chat ?? [], tudo: true });
  }

  desligar(c: Conexao): void {
    this.conexoes.delete(c);
    c.sala = null;
    c.assento = null;
    c.token = null;
    this.transmitir();
  }

  /** tira a conexão da sala avisando que ela saiu (a tela volta para o início) */
  private soltar(c: Conexao): void {
    c.enviar({ t: 'saiu' });
    this.conexoes.delete(c);
    c.sala = null;
    c.assento = null;
    c.token = null;
  }

  /** todas as conexões de um assento saem (a pessoa saiu: a segunda aba dela não fica no assento) */
  private soltarAssento(i: number): void {
    for (const c of [...this.conexoes]) if (c.assento === i) this.soltar(c);
  }

  /** quem conduz a sala saiu: passa para outra pessoa que continua nela */
  private novoAnfitriao(saiu: number): void {
    const outro = this.d.assentos.findIndex((a, k) => k !== saiu && a.tipo === 'humano' && !a.saiu);
    if (outro >= 0) this.d.anfitriao = outro;
  }

  /** partida acabou: os assentos de quem saiu no meio dela vagam (a sala continua encerrada: quem ficou vê o fim) */
  private vagarQuemSaiu(): void {
    for (const [k, a] of this.d.assentos.entries()) {
      if (a.tipo !== 'humano' || !a.saiu) continue;
      this.soltarAssento(k);
      this.d.assentos[k] = { tipo: 'vazio', nome: null, deck: null, token: null, paradas: paradasPadrao() };
      this.d.etapa = 'lugares';
      if (k === this.d.anfitriao) this.novoAnfitriao(k);
    }
  }

  /**
   * Sala encerrada com um lugar vago (alguém saiu, um bot foi tirado ou alguém chega): volta para o saguão, nos
   * lugares, sem a partida antiga. Quem está na sala vai para o saguão e quem entra não recebe a vista dela.
   */
  private voltarAoSaguao(): void {
    this.d.estado = 'espera';
    this.d.etapa = 'lugares';
    this.d.partida = null;
    this.game = null;
    this.bots = new Map();
    this.metas = [];
    this.cps = [];
    this.salvas = 0;
    this.erro = null;
    this.falhas = { indice: -1, n: 0 };
    this.geracao++;
    for (const a of this.d.assentos) delete a.saiu;
    this.gerente.banco.limparEntradas(this.d.codigo);
    this.gerente.pensadores?.esquecer(this.d.codigo);
  }

  tratar(c: Conexao, m: MsgCliente): string | null {
    const i = c.assento!;
    const anfitriao = i === this.d.anfitriao;
    switch (m.t) {
      case 'deck': {
        if (this.d.estado === 'jogando') return 'A partida já começou';
        if (!this.gerente.deck(m.deck)) return 'Deck desconhecido';
        this.d.assentos[i].deck = m.deck;
        break;
      }
      case 'bot': {
        if (!anfitriao) return 'Só quem criou a sala pode pôr bots';
        if (this.d.estado === 'jogando') return 'A partida já começou';
        const a = this.d.assentos[m.assento];
        if (!a || a.tipo === 'humano') return 'Esse assento não está livre';
        if (m.deck === null) {
          this.d.assentos[m.assento] = { tipo: 'vazio', nome: null, deck: null, token: null, paradas: paradasPadrao() };
          // um lugar vagou: o saguão volta para os lugares (e a sala encerrada, para o saguão)
          this.d.etapa = 'lugares';
          if (this.d.estado === 'fim') this.voltarAoSaguao();
        } else {
          if (!this.gerente.deck(m.deck)) return 'Deck desconhecido';
          if (m.nivel !== undefined && !nivelValido(m.nivel)) return 'Nível de bot desconhecido';
          // o nome é sorteado quando o bot entra no assento e fica com ele (trocar o deck ou o nível não muda)
          const nome = a.tipo === 'bot' && a.nome ? a.nome : this.sortearNome(m.assento);
          this.d.assentos[m.assento] = { tipo: 'bot', nome, nivel: m.nivel ?? (a.tipo === 'bot' ? a.nivel : undefined) ?? NIVEL_PADRAO, deck: m.deck, token: null, paradas: paradasPadrao() };
        }
        break;
      }
      case 'iniciar': case 'novaPartida': {
        if (!anfitriao) return 'Só quem criou a sala pode começar';
        if (this.d.estado === 'jogando') return 'A partida já começou';
        // partida encerrada com um lugar vago (alguém saiu): a nova partida começa pelo saguão, onde o lugar se preenche
        if (this.d.estado === 'fim' && this.d.assentos.some((a) => a.tipo === 'vazio')) { this.voltarAoSaguao(); break; }
        const erro = this.iniciar();
        if (erro) return erro;
        break;
      }
      case 'sair': {
        const encerrada = this.d.estado === 'fim';
        if (this.pedido) this.encerrarPedido(null);
        if (this.d.estado === 'jogando' && this.game && !this.game.isOver()) {
          // o assento fica com a pessoa até a partida acabar (o jogador dela na partida saiu); aí ele vaga (vagarQuemSaiu)
          this.d.assentos[i].saiu = true;
          this.registrar(() => this.game!.concede(i));
        }
        if (this.d.estado !== 'jogando') {
          this.d.assentos[i] = { tipo: 'vazio', nome: null, deck: null, token: null, paradas: paradasPadrao() };
          this.d.etapa = 'lugares';
        }
        // esta conexão e as outras abas da pessoa no mesmo assento
        this.soltarAssento(i);
        if (i === this.d.anfitriao) this.novoAnfitriao(i);
        // a sala já estava encerrada: um lugar vagou e ela volta para o saguão (quem saiu agora e a concessão que encerrou
        // a partida não: quem ficou ainda vê o fim dela)
        if (encerrada) this.voltarAoSaguao();
        break;
      }
      case 'responder': {
        const g = this.game;
        if (!g || !g.pending) return 'Não há decisão pendente';
        if (this.pedido) return 'A mesa está parada esperando o pedido de desfazer';
        if (g.pending.player !== i) return 'Não é a sua vez de decidir';
        if (g.pending.id !== m.decisao) return 'Essa decisão já passou';
        const resposta = m.resposta as Answer;
        if (this.semAuxilios && resposta?.kind === 'payment' && resposta.auto) return 'Esta sala não permite pagamento automático';
        const err = g.check(i, resposta);
        if (err) return err;
        this.registrar(() => g.answer(i, resposta), true, i);
        break;
      }
      case 'paradas': {
        const p = paradasValidas(m.paradas);
        if (!p) return 'Paradas inválidas';
        this.d.assentos[i].paradas = p;
        break;
      }
      case 'passarTurno': {
        if (!this.game) return 'Não há partida';
        this.d.assentos[i].paradas.passUntilTurnEnds = this.game.state.turn.number;
        break;
      }
      case 'conceder': {
        if (!this.game || this.game.isOver()) return 'Não há partida em andamento';
        if (this.pedido) this.encerrarPedido(null);
        this.registrar(() => this.game!.concede(i));
        break;
      }
      case 'mulligan': {
        if (!anfitriao) return 'Só quem criou a sala escolhe a regra de mulligan';
        if (this.d.estado === 'jogando') return 'A partida já começou';
        if (m.regra !== 'londres' && m.regra !== 'livre') return 'Regra desconhecida';
        this.d.mulligan = m.regra;
        break;
      }
      case 'avatar': {
        if (m.avatar !== null && !avatarValido(m.avatar)) return 'Retrato desconhecido';
        this.d.assentos[i].avatar = m.avatar;
        break;
      }
      case 'auxilios': {
        if (!anfitriao) return 'Só quem criou a sala escolhe a regra de auxílios';
        if (this.d.estado === 'jogando') return 'A partida já começou';
        if (m.regra !== 'permitidos' && m.regra !== 'proibidos') return 'Regra desconhecida';
        this.d.auxilios = m.regra;
        break;
      }
      case 'etapa': {
        if (!anfitriao) return 'Só quem criou a sala avança o saguão';
        if (this.d.estado === 'jogando') return 'A partida já começou';
        if (m.etapa !== 'lugares' && m.etapa !== 'regras' && m.etapa !== 'decks') return 'Passo desconhecido';
        if (m.etapa !== 'lugares' && this.d.assentos.some((a) => a.tipo === 'vazio')) return 'Ainda há lugares livres (chame alguém ou ponha um bot)';
        this.d.etapa = m.etapa;
        break;
      }
      case 'desfazer': return this.pedirDesfazer(i);
      case 'desfazerResposta': {
        const p = this.pedido;
        if (!p) return 'Não há pedido de desfazer aberto';
        if (!p.faltam.has(i)) return p.de === i ? 'O pedido é seu' : 'Você já respondeu';
        if (!m.aceitar) { this.encerrarPedido(`${this.nome(i)} recusou desfazer a jogada de ${this.nome(p.de)}.`); return null; }
        p.faltam.delete(i);
        p.aceitaram.add(i);
        if (p.faltam.size === 0) this.aplicarDesfazer();
        else this.transmitir();
        return null;
      }
      case 'desfazerCancelar': {
        if (!this.pedido) return 'Não há pedido de desfazer aberto';
        if (this.pedido.de !== i) return 'Só quem pediu pode cancelar';
        this.encerrarPedido(`${this.nome(i)} cancelou o pedido de desfazer.`);
        return null;
      }
      case 'revelar': {
        const g = this.game;
        if (!g || g.isOver()) return 'Não há partida em andamento';
        const obj = Number(m.obj);
        if (!g.state.zones.hand[i]?.includes(obj)) return 'Essa carta não está na sua mão';
        const para = m.para === 'todos' ? 'todos' : Array.isArray(m.para) ? [...new Set(m.para.map(Number))].filter((p) => p !== i && g.state.players[p]) : null;
        if (!para || (para !== 'todos' && para.length === 0)) return 'Escolha para quem mostrar';
        const o = g.state.objects[obj];
        const aviso: MsgServidor = { t: 'revelada', de: i, def: o.def, nome: o.def, para };
        for (const c of this.conexoes) if (c.assento === i || para === 'todos' || para.includes(c.assento!)) c.enviar(aviso);
        return null;
      }
      case 'chat': {
        const texto = limparChat(m.texto);
        if (!texto) return null;
        const agora = Date.now();
        const recentes = (this.ritmoChat.get(i) ?? []).filter((t) => agora - t < CHAT_JANELA);
        if (recentes.length >= CHAT_RAJADA) return 'Muitas mensagens seguidas: espere um pouco';
        this.ritmoChat.set(i, [...recentes, agora]);
        const chat = this.d.chat ??= [];
        // o autor é quem está no assento agora (depois de uma partida encerrada, outra pessoa pode ter sentado ali)
        const a = this.d.assentos[i];
        const msg: MsgChat = { id: (chat.at(-1)?.id ?? 0) + 1, de: i, quem: idAutor(a.token), nome: a.nome ?? `Jogador ${i + 1}`, texto, em: agora };
        chat.push(msg);
        if (chat.length > CHAT_GUARDADAS) chat.splice(0, chat.length - CHAT_GUARDADAS);
        // fora da condução da partida: grava e entrega na hora, mesmo com a mesa parada
        this.salvar();
        for (const c of this.conexoes) if (c.assento !== null) c.enviar({ t: 'chat', msgs: [msg] });
        return null;
      }
      case 'posicao': {
        const g = this.game;
        if (!g || !this.d.partida) return 'Não há partida';
        const pos = this.d.partida.posicoes ??= {};
        if (m.limpar && m.obj !== undefined) {
          const o = g.state.objects[Number(m.obj)];
          if (o && controllerOf(g.g, Number(m.obj)) === i) delete pos[String(m.obj)];
        } else if (m.limpar) {
          for (const id of Object.keys(pos)) if (!g.state.objects[Number(id)] || controllerOf(g.g, Number(id)) === i) delete pos[id];
        } else {
          // uma carta, ou várias de uma vez (grupo selecionado): vale tudo ou nada
          const itens: unknown[] = m.lista !== undefined ? (Array.isArray(m.lista) ? m.lista : []) : [{ obj: m.obj, x: m.x, y: m.y }];
          if (!itens.length || itens.length > 300) return 'Posição inválida';
          const ok = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= -0.05 && n <= 1.05;
          const novas: [string, [number, number]][] = [];
          for (const it of itens) {
            const q = (it ?? {}) as { obj?: unknown; x?: unknown; y?: unknown };
            const obj = Number(q.obj);
            if (!Number.isInteger(obj) || !ok(q.x) || !ok(q.y)) return 'Posição inválida';
            const o = g.state.objects[obj];
            // a carta já saiu do campo (ex.: o Campo de Lótus que se sacrifica ao entrar, antes de a posição chegar):
            // não há o que arrumar, e não é erro de ninguém
            if (!o || o.zone !== 'battlefield') continue;
            if (controllerOf(g.g, obj) !== i) return 'Você só arruma as suas permanentes';
            // 4 casas: menos de 0,2 px numa tela grande (a carta fica onde foi solta)
            novas.push([String(obj), [Math.round((q.x as number) * 10000) / 10000, Math.round((q.y as number) * 10000) / 10000]]);
          }
          // limpa as entradas de objetos que já saíram do campo
          for (const id of Object.keys(pos)) if (g.state.objects[Number(id)]?.zone !== 'battlefield') delete pos[id];
          for (const [id, q] of novas) pos[id] = q;
        }
        // só visual: grava e mostra a todos na hora, sem passar pela condução da partida
        this.salvar();
        this.transmitir();
        return null;
      }
      default: return 'Mensagem desconhecida';
    }
    this.salvar();
    // a vista sai no fim da condução (bots e passes automáticos), para ninguém ver uma
    // decisão que o servidor vai passar sozinho
    this.seguir();
    return null;
  }

  // ------------------------------------------------------------------ partida
  private iniciar(): string | null {
    const ocupados = this.d.assentos.filter((a) => a.tipo !== 'vazio');
    if (ocupados.length !== this.d.assentos.length) return 'Ainda há assentos vazios (chame alguém ou ponha um bot)';
    if (ocupados.some((a) => !a.deck)) return 'Todos precisam escolher um deck';
    // 96 bits sorteados: o hash curto que sai na sala (idPartida) não dá para desfazer tentando sementes
    const semente = this.gerente.sementeFixa ?? `${this.d.codigo}-${Date.now().toString(36)}-${randomBytes(12).toString('base64url')}`;
    const config: GameConfig = {
      seed: semente,
      players: this.d.assentos.map((a, i) => ({ name: a.nome ?? `Jogador ${i + 1}`, deckId: a.deck! })),
      startingLife: 40, // CR 903.7
      turnLimit: null,
      multiplayer: this.d.modo === '4p',
      manualMode: true,
      mulligan: this.d.mulligan ?? 'londres',
      // partidas novas: desvirar à mão tira a mana da reserva (as salvas antes ficam sem a chave e não mudam)
      desvirarTiraMana: true,
    };
    const deckIds = this.d.assentos.map((a) => a.deck!);
    const listas = deckIds.map((id) => this.gerente.deck(id));
    if (listas.some((l) => !l)) return 'Um dos decks escolhidos não está mais disponível; escolha outro';
    this.d.partida = { config, deckIds, listas: structuredClone(listas as DeckList[]), checkpoint: null };
    this.d.estado = 'jogando';
    this.gerente.banco.limparEntradas(this.d.codigo);
    this.salvas = 0;
    this.erro = null;
    this.criarGame(null, []);
    return null;
  }

  /**
   * Cria (ou recria, depois de um reinício) a partida a partir da semente e das entradas. Uma entrada gravada que não
   * dá mais para aplicar (o motor a recusa ou quebra nela) não deixa a sala sem partida: ela é refeita até a última
   * entrada boa, e as gravadas dali em diante saem do banco (ficam no registro do servidor).
   */
  criarGame(cp: Checkpoint | null, entradas: Input[], metas: (MetaEntrada | null)[] = []): void {
    const p = this.d.partida!;
    const decks = this.decks();
    const { game, aplicadas, erro } = Game.replayAteFalhar(p.config, decks, entradas, cp);
    this.game = game;
    if (aplicadas < entradas.length) {
      console.error(`[sala ${this.d.codigo}] a partida salva foi refeita até a entrada ${aplicadas} de ${entradas.length}; a seguinte não vale mais (${erro?.message}). Entradas descartadas:`, JSON.stringify(entradas.slice(aplicadas)));
      this.gerente.banco.truncarEntradas(this.d.codigo, aplicadas);
      if (p.checkpoint && p.checkpoint.inputIndex > aplicadas) { p.checkpoint = null; this.salvar(); }
    }
    this.salvas = this.game.inputs.length;
    this.metas = this.game.inputs.map((_, k) => metas[k] ?? null);
    this.cps = [];
    this.criarBots();
    if (this.game.isOver()) this.d.estado = 'fim';
  }

  private decks(): DeckList[] {
    const p = this.d.partida!;
    if (!p.listas && !preencherListas(p, (id) => this.gerente.deck(id))) throw new Error('Um dos decks da partida não está mais disponível');
    return p.listas!;
  }

  private criarBots(): void {
    const seed = this.d.partida!.config.seed;
    const sims = this.gerente.atrasos.simulacoesBot;
    const tempo = this.gerente.atrasos.tempoBot ?? null;
    this.bots = new Map(this.d.assentos.map((a, i) => [i, a] as const).filter(([, a]) => a.tipo === 'bot')
      .map(([i, a]) => [i, new HeuristicBot(`${seed}:${i}`, i, { nivel: a.nivel ?? NIVEL_PADRAO, ...(sims !== null ? { simulacoes: sims } : {}), ...(tempo !== null ? { orcamento: tempo } : {}) })]));
    this.geracao++;
  }

  /** um nome de bot que ainda não está na sala (nem de bot nem de pessoa) */
  private sortearNome(assento: number): string {
    const usados = new Set(this.d.assentos.filter((_, k) => k !== assento).map((a) => a.nome?.toUpperCase()).filter(Boolean));
    const livres = NOMES_BOTS.filter((n) => !usados.has(n));
    return livres.length ? livres[randomInt(livres.length)] : `BOT ${assento + 1}`;
  }


  private nome(i: number): string { return this.game?.state.players[i]?.name ?? this.d.assentos[i]?.nome ?? `Jogador ${i + 1}`; }

  /**
   * Aplica uma entrada e grava as novas no banco; `humana`: foi a pessoa que fez (conta para o desfazer); `autor`: o
   * assento de quem mandou a resposta (recebe o erro do motor como resposta à mensagem dela)
   */
  private registrar(fn: () => unknown, humana = false, autor: number | null = null): void {
    const g = this.game!;
    const turno = g.state.turn.number;
    const n0 = g.inputs.length;
    try {
      fn();
    } catch (e) {
      // a entrada que quebrou o motor não entrou em g.inputs (motor/game.ts): a sala se refaz sem ela
      this.falha(e, autor);
      return;
    }
    for (let k = n0; k < g.inputs.length; k++) this.metas[k] = { turno, humana };
    if (g.inputs.length > n0) this.falhas = { indice: -1, n: 0 };
    // Cartomante e Magic God: leem a mesa a cada jogada (só o que é público)
    for (const b of this.bots.values()) if (b.e.memoria) b.observar(g.g);
    this.persistir();
  }

  private persistir(): void {
    const g = this.game!;
    if (g.inputs.length > this.salvas) {
      this.gerente.banco.adicionarEntradas(this.d.codigo, this.salvas, g.inputs.slice(this.salvas), this.metas.slice(this.salvas));
      // checkpoint de tempos em tempos, numa decisão de prioridade (o laço é retomável ali)
      if (Math.floor(g.inputs.length / 40) > Math.floor(this.salvas / 40)) {
        const cp = g.checkpoint();
        if (cp) { this.d.partida!.checkpoint = cp; this.salvar(); }
      }
      this.salvas = g.inputs.length;
    }
    // começo de cada turno guardado na memória: o desfazer refaz a partida a partir dele
    const ultimo = this.cps[this.cps.length - 1];
    if (g.pending?.kind === 'priority' && (!ultimo || ultimo.state.turn.number !== g.state.turn.number)) {
      const cp = g.checkpoint();
      if (cp) { this.cps.push(cp); if (this.cps.length > 3) this.cps.shift(); }
    }
    if (g.isOver() && this.d.estado === 'jogando') {
      this.d.estado = 'fim';
      this.vagarQuemSaiu();
      this.salvar();
      this.gerente.pensadores?.esquecer(this.d.codigo);
    }
  }

  // ------------------------------------------------------------------ desfazer
  private alvoDesfazer(i: number): number | null {
    const g = this.game;
    if (!g || this.d.assentos[i]?.tipo !== 'humano') return null;
    return alvoDesfazer(g.inputs, this.metas, i, g.state.turn.number);
  }

  private pedidoPublico(): PedidoDesfazer | null {
    const p = this.pedido;
    if (!p) return null;
    return { de: p.de, linhas: p.linhas, aceitaram: [...p.aceitaram], faltam: [...p.faltam], restanteMs: Math.max(0, p.prazo - Date.now()), totalMs: this.gerente.atrasos.prazoDesfazer };
  }

  private pedirDesfazer(i: number): string | null {
    const g = this.game;
    if (!g || g.isOver() || this.d.estado !== 'jogando') return 'Não há partida em andamento';
    if (this.pedido) return 'Já há um pedido de desfazer aberto';
    const alvo = this.alvoDesfazer(i);
    if (alvo === null) return 'Não há jogada sua para desfazer neste turno';
    let voltar: Game;
    try {
      voltar = reconstruir(this.d.partida!.config, this.decks(), g.inputs, [...this.cps, this.d.partida!.checkpoint], alvo);
    } catch (e) {
      console.error(`[sala ${this.d.codigo}] não foi possível refazer a partida para desfazer:`, e);
      return 'Não foi possível voltar a partida para antes dessa jogada';
    }
    const outros = this.d.assentos.map((_, k) => k).filter((k) => k !== i && !g.state.players[k]?.left);
    const faltam = new Set(outros.filter((k) => this.d.assentos[k].tipo === 'humano'));
    // os bots aceitam na hora
    const aceitaram = new Set(outros.filter((k) => this.d.assentos[k].tipo === 'bot'));
    const prazo = Date.now() + this.gerente.atrasos.prazoDesfazer;
    const timer = setTimeout(() => { if (this.pedido?.timer === timer) this.encerrarPedido(`O pedido de desfazer de ${this.nome(i)} não teve resposta a tempo.`); }, this.gerente.atrasos.prazoDesfazer);
    this.pedido = { de: i, alvo, voltar, linhas: linhasDesfeitas(g, voltar, g.inputs[alvo]), aceitaram, faltam, prazo, timer };
    if (faltam.size === 0) this.aplicarDesfazer();
    else this.transmitir();
    return null;
  }

  /** fecha o pedido sem desfazer nada, e a mesa segue */
  private encerrarPedido(msg: string | null): void {
    const p = this.pedido;
    if (!p) return;
    clearTimeout(p.timer);
    this.pedido = null;
    if (msg) this.avisar(msg);
    this.transmitir();
    this.seguir();
  }

  private aplicarDesfazer(): void {
    const p = this.pedido!;
    clearTimeout(p.timer);
    this.pedido = null;
    const partida = this.d.partida!;
    this.game = p.voltar;
    this.metas = this.metas.slice(0, p.alvo);
    this.salvas = p.alvo;
    this.cps = this.cps.filter((c) => c.inputIndex <= p.alvo);
    this.gerente.banco.truncarEntradas(this.d.codigo, p.alvo);
    if (partida.checkpoint && partida.checkpoint.inputIndex > p.alvo) partida.checkpoint = this.cps[this.cps.length - 1] ?? null;
    // posições de permanentes que deixaram de existir saem (os números de objeto voltam a ser usados)
    const campo = new Set(this.game.state.zones.battlefield);
    for (const id of Object.keys(partida.posicoes ?? {})) if (!campo.has(Number(id))) delete partida.posicoes![id];
    this.criarBots();
    this.salvar();
    this.avisar(`${this.nome(p.de)} desfez: ${p.linhas[0]?.texto ?? 'a última jogada'}`);
    this.transmitir();
    this.seguir();
  }

  private avisar(msg: string): void {
    for (const c of this.conexoes) c.enviar({ t: 'aviso', msg });
  }

  /**
   * Um bot pensa uma decisão: numa thread de pensar (servidor) ou aqui mesmo (testes, threads = 0). Só manda o
   * checkpoint mais recente e as entradas; a thread refaz a partida e decide no mundo do bot (bots/pensar.ts).
   */
  private async pensarBot(bot: HeuristicBot, decisao: number, g: Game): Promise<Answer | null> {
    const pens = this.gerente.pensadores!;
    const cps = [...this.cps, this.d.partida!.checkpoint].filter((c): c is Checkpoint => !!c && c.inputIndex <= g.inputs.length);
    const cp = cps.sort((a, b) => b.inputIndex - a.inputIndex)[0] ?? null;
    const sims = this.gerente.atrasos.simulacoesBot;
    const assento = bot.eu;
    const aviso = setTimeout(() => { this.pensando = assento; this.avisarPensando(); }, this.gerente.atrasos.avisoPensando);
    try {
      const r = await pens.pensar({
        sala: this.d.codigo, geracao: this.geracao, cp, entradas: g.inputs, listas: this.decks(),
        tarefa: { nivel: bot.nivel, eu: assento, estado: bot.e, decisao, jaImediata: true, config: this.d.partida!.config, ...(sims !== null ? { opcoes: { simulacoes: sims } } : {}), ...(this.gerente.atrasos.tempoBot ? { tempo: this.gerente.atrasos.tempoBot } : {}) },
      });
      if (r && this.bots.get(assento) === bot) bot.e = r.estado;
      return r?.resposta ?? null;
    } catch (e) {
      console.error(`[sala ${this.d.codigo}] o bot ${this.nome(assento)} não conseguiu pensar:`, e);
      return null;
    } finally {
      clearTimeout(aviso);
      if (this.pensando === assento) { this.pensando = null; this.avisarPensando(); }
    }
  }

  private avisarPensando(): void {
    for (const c of this.conexoes) c.enviar({ t: 'pensando', assento: this.pensando });
  }

  /**
   * Erro do motor numa jogada (ou na condução): a sala se refaz das entradas boas a partir do checkpoint mais recente
   * (a jogada que quebrou não entrou), limpa o erro, avisa a mesa e segue; a decisão volta para quem jogava. O bot
   * cuja jogada quebrou o motor responde o padrão na vez seguinte. Três falhas seguidas na mesma posição (uma
   * resposta automática que quebra sempre) param a sala com o erro, como antes: a partida fica salva até a última
   * jogada válida e volta assim que o servidor reiniciar. `autor`: quem mandou a resposta (o erro vai para essa pessoa
   * como resposta ao 'responder' dela).
   */
  private falha(e: unknown, autor: number | null = null): void {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[sala ${this.d.codigo}] erro do motor:`, e);
    // só as respostas automáticas (bot, passe automático, condução) contam: a pessoa escolhe de novo, não há laço
    const automatica = autor === null;
    if (automatica) {
      const indice = this.game?.inputs.length ?? -1;
      this.falhas = this.falhas.indice === indice ? { indice, n: this.falhas.n + 1 } : { indice, n: 1 };
    }
    const refeita = (!automatica || this.falhas.n <= 3) && this.refazer();
    const texto = refeita ? `Erro interno do motor: ${msg}. A jogada foi desfeita e a partida continua de antes dela.`
      : `Erro interno do motor: ${msg}. A partida foi salva até a última jogada válida.`;
    for (const c of this.conexoes) c.enviar({ t: 'erro', msg: texto, ...(autor !== null && c.assento === autor ? { de: 'responder' as const } : {}) });
    if (!refeita) { this.erro = msg; return; }
    this.erro = null;
    this.transmitir();
    // dentro da condução (a jogada era de um bot ou um passe automático), o laço em andamento pega a partida refeita
    this.seguir();
  }

  /** a partida refeita das entradas boas (as que o motor aplicou), a partir do checkpoint mais recente que serve */
  private refazer(): boolean {
    const g = this.game;
    const p = this.d.partida;
    if (!g || !p) return false;
    try {
      this.game = reconstruir(p.config, this.decks(), g.inputs, [...this.cps, p.checkpoint], g.inputs.length);
    } catch (e) {
      console.error(`[sala ${this.d.codigo}] não foi possível refazer a partida depois do erro:`, e);
      return false;
    }
    this.metas.length = this.game.inputs.length;
    // respostas pensadas para a partida de antes não valem (os bots continuam com a memória deles)
    this.geracao++;
    return true;
  }

  /** conduz a partida sem esperar por ela. Um erro inesperado na condução (fora do motor: a vista, o bot, o banco)
   * vira erro da sala, tratado como um erro do motor; sem o `.catch`, a promessa rejeitada derrubava o servidor */
  seguir(): void {
    this.avancar().catch((e) => this.falha(e));
  }

  /** bots respondem e passes automáticos acontecem até alguém humano precisar decidir */
  async avancar(): Promise<void> {
    // um bot está pensando numa thread: a mesa está parada nele, então dá para mostrar o que mudou (paradas, posições…)
    if (this.rodando) { if (this.esperandoBot) this.transmitir(); return; }
    this.rodando = true;
    const at = this.gerente.atrasos;
    try {
      for (let guarda = 0; guarda < 100000; guarda++) {
        const g = this.game;
        if (!g || !g.pending || g.isOver() || this.erro || this.pedido) break;
        const d = g.pending;
        const a = this.d.assentos[d.player];
        let resposta: Answer | null = null;
        let espera = 0;
        if (a.tipo === 'bot') {
          const bot = this.bots.get(d.player)!;
          const geracao = this.geracao;
          // a resposta do bot a esta decisão quebrou o motor (a sala se refez sem ela): agora vai a resposta padrão
          if (this.falhas.indice === g.inputs.length && this.falhas.n > 0) resposta = defaultAnswer(d);
          // decisão óbvia: sai da vista do bot (a mesma que uma pessoa naquele assento recebe), sem pensar
          else resposta = bot.imediata(d, buildView(g.g, d.player, d), (x) => g.check(d.player, x) === null);
          if (!resposta && !this.gerente.pensadores) {
            // sem threads (testes): pensa aqui mesmo, sem soltar a linha (o fluxo da sala fica igual ao de antes)
            bot.rastro.observar(g);
            resposta = bot.decidir(bot.contextoLocal(d, g));
          } else if (!resposta) {
            this.esperandoBot = true;
            try { resposta = await this.pensarBot(bot, d.id, g); } finally { this.esperandoBot = false; }
            if (this.game !== g || g.pending?.id !== d.id || this.pedido || this.geracao !== geracao) continue; // algo mudou enquanto pensava
            if (!resposta) resposta = defaultAnswer(d);
          }
          const visivel = (d.kind === 'priority' && resposta.kind === 'priority' && resposta.action !== 'pass') || d.kind === 'attackers' || d.kind === 'blockers';
          espera = visivel ? at.botAcao : at.botPasse;
        } else if (shouldAutoPass(g.state, d, d.player, this.paradasEfetivas(a))) {
          resposta = { kind: 'priority', action: 'pass' };
          espera = at.autoPasse;
        }
        if (!resposta) break;
        if (espera > 0) {
          // mostra a mesa antes da jogada do bot; num passe automático não, para a decisão
          // de quem está passando não aparecer na tela por um instante
          if (a.tipo === 'bot') this.transmitir();
          await dorme(espera);
          if (this.game !== g || g.pending?.id !== d.id || this.pedido) continue; // algo mudou enquanto esperava
        }
        const r = resposta;
        this.registrar(() => {
          let res = g.answer(d.player, r);
          // rede de segurança: resposta de bot recusada vira a resposta neutra do motor
          if (!res.ok && a.tipo === 'bot') res = g.answer(d.player, defaultAnswer(d));
          if (!res.ok) throw new Error(`Resposta automática recusada: ${res.error}`);
        });
      }
    } finally {
      this.rodando = false;
    }
    this.transmitir();
  }
}

export class Gerente {
  salas = new Map<string, Sala>();
  private decks: Map<string, DeckList>;

  banco: Banco;
  atrasos: Atrasos;

  /** threads de pensar dos bots, divididas por todas as salas (null: pensam na linha principal) */
  readonly pensadores: Pensadores | null;

  /** só para testes: toda partida nova usa esta semente (mãos e grimórios sempre os mesmos; null: sorteada) */
  sementeFixa: string | null = null;

  constructor(banco: Banco, decks: DeckList[], atrasos: Atrasos = ATRASOS_PADRAO) {
    this.banco = banco;
    this.atrasos = atrasos;
    this.pensadores = atrasos.threads > 0 ? new Pensadores(atrasos.threads) : null;
    this.decks = new Map(decks.map((d) => [d.id, d]));
  }

  deck(id: string): DeckList | undefined { return this.decks.get(id); }

  /** decks do saguão depois de uma importação ou atualização (as partidas em andamento guardam as listas delas) */
  trocarDecks(decks: DeckList[]): void {
    this.decks = new Map(decks.map((d) => [d.id, d]));
  }

  /** recarrega as salas salvas e retoma as partidas em andamento */
  restaurar(): void {
    for (const { dados } of this.banco.salas()) {
      const d = dados as DadosSala;
      for (const a of d.assentos) if (paradasAntigas(a.paradas)) a.paradas = { ...paradasPadrao(), skipWhenNothing: a.paradas.skipWhenNothing };
      // mensagens do chat de antes do id de autor: de ninguém (o cliente não as toma como suas)
      for (const m of d.chat ?? []) m.quem ??= '';
      const s = new Sala(d, this);
      this.salas.set(d.codigo, s);
      if (d.partida && !d.partida.listas && preencherListas(d.partida, (id) => this.deck(id))) s.salvar();
      if (d.partida && d.estado !== 'espera') {
        try {
          s.criarGame(d.partida.checkpoint, this.banco.entradas(d.codigo) as Input[], this.banco.metas(d.codigo) as (MetaEntrada | null)[]);
          s.seguir();
        } catch (e) {
          s.erro = e instanceof Error ? e.message : String(e);
          console.error(`[sala ${d.codigo}] não foi possível retomar a partida:`, e);
        }
      }
    }
  }

  private novoCodigo(): string {
    for (;;) {
      const c = Array.from({ length: 5 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
      if (!this.salas.has(c)) return c;
    }
  }

  tratar(c: Conexao, m: MsgCliente): void {
    // batimento do cliente: responde na hora só a esta conexão, com ou sem sala, sem gravar nada nem contar no ritmo
    if (m?.t === 'ping') { c.enviar({ t: 'pong' }); return; }
    const erro = this.tratarInterno(c, m);
    // o erro diz a que mensagem responde: o cliente só trata como jogada recusada o que veio de 'responder'
    const de = tipoMsg(m);
    if (erro) c.enviar({ t: 'erro', msg: erro, ...(de ? { de } : {}) });
  }

  private tratarInterno(c: Conexao, m: MsgCliente): string | null {
    // a forma de toda mensagem é conferida aqui, antes de qualquer sala tocar nela (protocolo.ts)
    const invalida = validarMsg(m);
    if (invalida) return invalida;
    switch (m.t) {
      case 'criar': {
        const nome = limparNome(m.nome);
        if (!nome) return 'Escolha um nome';
        if (typeof m.senhaSala !== 'string' || m.senhaSala.length < 3 || m.senhaSala.length > 64) return 'A senha da sala precisa ter de 3 a 64 caracteres';
        if (m.modo !== '4p' && m.modo !== '1v1') return 'Modo inválido';
        const codigo = this.novoCodigo();
        const n = m.modo === '4p' ? 4 : 2;
        const vazio = (): Assento => ({ tipo: 'vazio', nome: null, deck: null, token: null, paradas: paradasPadrao() });
        const s = new Sala({ codigo, senha: hashSenha(m.senhaSala), modo: m.modo, estado: 'espera', assentos: Array.from({ length: n }, vazio), anfitriao: 0, partida: null }, this);
        this.salas.set(codigo, s);
        s.sentar(c, nome);
        s.salvar();
        s.transmitir();
        return null;
      }
      case 'entrar': {
        const s = this.salas.get(String(m.codigo ?? '').toUpperCase().trim());
        if (!s || typeof m.senhaSala !== 'string' || !confereSenha(m.senhaSala, s.d.senha)) return 'Código ou senha da sala incorretos';
        const nome = limparNome(m.nome);
        if (!nome) return 'Escolha um nome';
        // a mesma conexão não toma um segundo assento da sala em que já está
        if (c.sala === s && c.assento !== null) return 'Você já está nesta sala';
        if (s.d.estado === 'jogando') return 'A partida já começou; quem já está na sala pode voltar pelo mesmo aparelho';
        if (s.sentar(c, nome) === null) return 'A sala está cheia';
        s.salvar();
        s.transmitir();
        return null;
      }
      case 'retomar': {
        const s = this.salas.get(String(m.codigo ?? '').toUpperCase().trim());
        const i = s ? s.d.assentos.findIndex((a) => a.token && typeof m.token === 'string' && a.token === m.token) : -1;
        if (!s || i < 0) return 'Não foi possível voltar à sala';
        // quem tinha saído no meio da partida e volta fica com o assento quando ela acabar
        delete s.d.assentos[i].saiu;
        s.ligar(c, i);
        s.transmitir();
        return null;
      }
      default:
        if (!c.sala || c.assento === null) return 'Entre numa sala primeiro';
        return c.sala.tratar(c, m);
    }
  }

  desconectar(c: Conexao): void {
    if (c.sala) c.sala.desligar(c);
  }
}

export function semAtraso(): Atrasos { return SEM_ATRASO; }

/** guarda na partida a lista atual de cada assento (salas salvas antes da importação de decks) */
function preencherListas(p: DadosPartida, deck: (id: string) => DeckList | undefined): boolean {
  const listas = p.deckIds.map(deck);
  if (listas.some((l) => !l)) return false;
  p.listas = structuredClone(listas as DeckList[]);
  return true;
}

/**
 * Para a linha de comando, antes de trocar uma lista com o servidor desligado: as salas salvas sem as listas
 * recebem as atuais (o servidor faz o mesmo ao subir). Devolve quantas salas mudaram.
 */
export function preencherListasSalvas(banco: Banco, decks: DeckList[]): number {
  const m = new Map(decks.map((d) => [d.id, d]));
  let n = 0;
  for (const { codigo, dados } of banco.salas()) {
    const d = dados as DadosSala;
    if (d.partida && !d.partida.listas && preencherListas(d.partida, (id) => m.get(id))) { banco.salvarSala(codigo, d); n++; }
  }
  return n;
}
export { novoToken };
