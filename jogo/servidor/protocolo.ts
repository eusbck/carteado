// Mensagens entre cliente e servidor (WebSocket, JSON). O cliente importa só os tipos; o servidor usa também o
// validador das mensagens do cliente (validarMsg, no fim).

import type { NivelBot } from '../bots/niveis.ts';
import type { StopSettings } from '../motor/autopass.ts';
import type { Answer } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';

export type Modo = '4p' | '1v1';
export type RegraMulligan = 'londres' | 'livre';
/** auxílios da interface (brilhos, avisos, pagar automaticamente): cada um escolhe, ou a sala proíbe todos */
export type RegraAuxilios = 'permitidos' | 'proibidos';
export type TipoAssento = 'humano' | 'bot' | 'vazio';
/** passos do saguão, um de cada vez: quem joga entra (e o anfitrião põe bots), o anfitrião define as regras, cada um
 * escolhe o deck. O anfitrião avança; a sala volta para os lugares quando um lugar vaga. */
export type EtapaSaguao = 'lugares' | 'regras' | 'decks';

export interface AssentoPublico {
  indice: number;
  tipo: TipoAssento;
  nome: string | null;
  deck: string | null;
  conectado: boolean;
  /** nível do bot (null para pessoas e assentos vazios) */
  nivel?: NivelBot | null;
  /** retrato escolhido (servidor/avatares.ts); null: o do comandante do deck, ou a inicial do nome */
  avatar?: string | null;
}

export interface SalaPublica {
  codigo: string;
  modo: Modo;
  estado: 'espera' | 'jogando' | 'fim';
  assentos: AssentoPublico[];
  anfitriao: number;
  /** regra de mulligan escolhida por quem criou a sala */
  mulligan: RegraMulligan;
  /** regra de auxílios escolhida por quem criou a sala */
  auxilios: RegraAuxilios;
  /** identificador da partida (hash curto da semente; null sem partida). A semente fica só no servidor: com ela dava
   * para refazer os embaralhamentos e ver o grimório e a mão de todos */
  partida: string | null;
  /** passo do saguão em que a sala está (vale com a sala esperando) */
  etapa: EtapaSaguao;
}

export interface DeckResumo {
  id: string;
  nome: string;
  comandante: string;
  cores: string[];
}

/** uma carta na tela Decks */
export interface CartaCatalogo {
  nome: string;
  quantidade: number;
  /** nome da impressão em português, se houver */
  pt: string | null;
  /** id da imagem (/img/<id>/frente/p), se houver */
  img: string | null;
  tipo: string;
  /** a carta já tem regras no jogo */
  pronta: boolean;
}

/** a lista de um deck jogável, para a prévia no saguão */
export interface ListaDeck {
  id: string;
  nome: string;
  comandante: CartaCatalogo;
  /** as outras cartas (sem o comandante) */
  cartas: CartaCatalogo[];
}

/** um deck na tela Decks (jogável ou não) */
export interface DeckCatalogo {
  id: string;
  nome: string;
  link: string;
  comandante: string;
  comandantePt: string | null;
  cores: string[];
  /** id da imagem do comandante (arte de fundo do cartão) */
  arte: string | null;
  /** pronto: no saguão; preparacao: falta implementar cartas; atualizacao: jogável, com uma versão nova esperando cartas */
  estado: 'pronto' | 'preparacao' | 'atualizacao';
  importadoEm: string;
  verificadoEm: string | null;
  /** data da versão no Moxfield */
  atualizadoEm: string | null;
  /** cartas diferentes da lista (com o comandante) */
  total: number;
  /** versão que espera cartas: um deck novo ou uma atualização */
  preparacao: {
    prontas: number;
    total: number;
    faltam: CartaCatalogo[];
    entram: CartaCatalogo[];
    saem: CartaCatalogo[];
    comandante: { de: string; para: string } | null;
    recebidaEm: string;
  } | null;
}

/** o que confirmar a importação ou a atualização vai fazer (passo 1, nada gravado ainda) */
export interface Proposta {
  token: string;
  id: string;
  nome: string;
  link: string;
  /** o deck ainda não está na mesa */
  novo: boolean;
  comandante: string;
  comandantePt: string | null;
  /** cartas diferentes da lista nova (com o comandante) e quantas já têm regras */
  total: number;
  prontas: number;
  faltam: CartaCatalogo[];
  /** diferença para a lista atual (ou para a em preparação, num deck que ainda não está na mesa) */
  entram: CartaCatalogo[];
  saem: CartaCatalogo[];
  trocaComandante: { de: string; para: string } | null;
  /** jogavel: entra no saguão ao confirmar; preparacao: fica esperando as cartas; nada: não mudou nada */
  destino: 'jogavel' | 'preparacao' | 'nada';
  /** o que confirmar faz, em uma frase */
  resumo: string;
  /** regras de deck que a lista não cumpre: impedem confirmar */
  erros: string[];
  avisos: string[];
}

/** importação ou atualização em andamento (uma por vez para a mesa toda) */
export interface TarefaPublica {
  id: number;
  tipo: 'verificar' | 'confirmar';
  deck: string | null;
  nome: string | null;
  etapa: string;
  feito: number;
  total: number;
  estado: 'andando' | 'pronta' | 'erro';
  erro?: string;
  proposta?: Proposta;
  resultado?: { id: string; destino: 'jogavel' | 'preparacao' | 'nada'; texto: string };
}

/** imagem de cada carta/ficha pelo nome da definição */
export interface InfoCarta {
  /** id da imagem da frente (pasta em cartas/assets/cards) */
  f: string | null;
  /** id da imagem do verso, se a carta tiver duas faces */
  v: string | null;
  /** nome da impressão em português, se houver */
  pt: string | null;
  /** carta ainda sem definição: o efeito é aplicado no modo manual */
  pendente: boolean;
  /** texto Oracle em inglês (para o zoom e para as pendentes) */
  oracle: string;
  /** é uma ficha (para o ajuste manual "criar ficha") */
  ficha?: boolean;
  /** nome para mostrar */
  nome?: string;
}

/** uma linha do que um pedido de desfazer vai voltar */
export interface LinhaDesfeita {
  texto: string;
  /** a linha é de outro jogador (jogada que volta junto) */
  outro: boolean;
}

/** pedido de desfazer aberto: a mesa fica parada até todos os humanos aceitarem */
export interface PedidoDesfazer {
  de: number;
  linhas: LinhaDesfeita[];
  aceitaram: number[];
  faltam: number[];
  /** tempo que falta para o pedido expirar, quando a mensagem saiu, e o prazo inteiro */
  restanteMs: number;
  totalMs: number;
}

/** uma mensagem do chat da sala (o nome fica gravado: quem senta depois no assento pode ter outro) */
export interface MsgChat {
  id: number;
  /** assento de quem escreveu */
  de: number;
  /** quem escreveu: o id de autor de quem ocupava o assento (o `quem` da mensagem `sala`). Outra pessoa que sente
   * depois no mesmo assento tem outro id. Vazio nas mensagens gravadas antes dele existir */
  quem: string;
  /** o nome de quem escreveu, como estava no assento */
  nome: string;
  texto: string;
  /** quando chegou ao servidor (ms desde 1970) */
  em: number;
}

export type MsgCliente =
  | { t: 'criar'; nome: string; senhaSala: string; modo: Modo }
  | { t: 'entrar'; codigo: string; senhaSala: string; nome: string }
  | { t: 'retomar'; codigo: string; token: string }
  | { t: 'deck'; deck: string }
  /** pôr (ou trocar o deck ou o nível de) um bot num assento; deck null tira o bot */
  | { t: 'bot'; assento: number; deck: string | null; nivel?: NivelBot }
  | { t: 'iniciar' }
  | { t: 'responder'; decisao: number; resposta: Answer }
  | { t: 'paradas'; paradas: StopSettings }
  | { t: 'passarTurno' }
  | { t: 'conceder' }
  | { t: 'sair' }
  | { t: 'novaPartida' }
  /** posição de uma permanente sua na sua área (x e y de 0 a 1), ou de várias de uma vez (`lista`, grupo
   * selecionado); limpar: volta a arrumação padrão (de uma ou de todas) */
  | { t: 'posicao'; obj?: number; x?: number; y?: number; limpar?: boolean; lista?: { obj: number; x: number; y: number }[] }
  | { t: 'mulligan'; regra: RegraMulligan }
  | { t: 'auxilios'; regra: RegraAuxilios }
  /** o anfitrião muda o passo do saguão */
  | { t: 'etapa'; etapa: EtapaSaguao }
  /** o retrato do seu assento (null: volta ao do comandante do deck) */
  | { t: 'avatar'; avatar: string | null }
  /** pedir para desfazer a sua última jogada deste turno; responder ou cancelar um pedido aberto */
  | { t: 'desfazer' }
  | { t: 'desfazerResposta'; aceitar: boolean }
  | { t: 'desfazerCancelar' }
  /** mostrar uma carta da sua mão a todos ou a alguns jogadores */
  | { t: 'revelar'; obj: number; para: number[] | 'todos' }
  /** mensagem no chat da sala */
  | { t: 'chat'; texto: string }
  /** batimento: o servidor responde `pong` na hora, com ou sem sala, sem gravar nada e fora de qualquer limite */
  | { t: 'ping' };

/** posição escolhida para cada permanente, pelo id do objeto: [x, y] de 0 a 1 dentro da área de quem a controla */
export type Posicoes = Record<string, [number, number]>;

// ---------------------------------------------------------------------------------------------------------------
// Validação das mensagens do cliente (a única porta de entrada: Gerente.tratar). Confere a forma: o tipo existe e os
// campos que a sala usa como índice ou objeto têm o tipo e o intervalo certos ('__proto__' como assento trocava o
// protótipo da lista de assentos e derrubava a sala). Os valores de lista fechada (passo do saguão, regra, nível,
// retrato, modo) e o que depende da sala (deck existe, assento livre, decisão pendente) a sala confere, com a
// mensagem própria de cada caso. Textos têm um teto de tamanho (a sala ainda limpa e corta).
// ---------------------------------------------------------------------------------------------------------------

/** maior número de assentos de uma sala (4 jogadores) */
export const MAX_ASSENTOS = 4;
/** teto de tamanho de qualquer texto de uma mensagem (nome, senha, código, deck, chat…) */
const TEXTO_MAX = 2000;

const ehObjeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const inteiro = (x: unknown, min: number, max: number) => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
/** texto dentro do teto; outro tipo passa (a sala limpa, recusa com a mensagem dela, ou ignora) */
const curto = (x: unknown) => typeof x !== 'string' || x.length <= TEXTO_MAX;
const sempre = () => true;

const FORMAS: { [T in MsgCliente['t']]: (m: Record<string, unknown>) => boolean } = {
  criar: (m) => curto(m.nome) && curto(m.senhaSala),
  entrar: (m) => curto(m.codigo) && curto(m.senhaSala) && curto(m.nome),
  retomar: (m) => curto(m.codigo) && curto(m.token),
  deck: (m) => curto(m.deck),
  // o assento vira índice da lista de assentos: inteiro e no intervalo (a sala confere o tamanho dela)
  bot: (m) => inteiro(m.assento, 0, MAX_ASSENTOS - 1) && (m.deck === null || typeof m.deck === 'string') && curto(m.deck) && curto(m.nivel),
  iniciar: sempre,
  novaPartida: sempre,
  // a resposta vai para o motor, que confere o resto pela decisão pendente
  responder: (m) => inteiro(m.decisao, 0, Number.MAX_SAFE_INTEGER) && ehObjeto(m.resposta) && typeof m.resposta.kind === 'string',
  paradas: sempre,
  passarTurno: sempre,
  conceder: sempre,
  sair: sempre,
  posicao: (m) => m.lista === undefined || (Array.isArray(m.lista) && m.lista.length <= 300),
  mulligan: sempre,
  auxilios: sempre,
  etapa: sempre,
  avatar: (m) => curto(m.avatar),
  desfazer: sempre,
  desfazerResposta: (m) => typeof m.aceitar === 'boolean',
  desfazerCancelar: sempre,
  revelar: (m) => m.para === 'todos' || (Array.isArray(m.para) && m.para.length <= MAX_ASSENTOS),
  chat: (m) => curto(m.texto),
  ping: sempre,
};

/** o tipo da mensagem do cliente, se for um que existe (vai no `de` dos erros) */
export function tipoMsg(m: unknown): MsgCliente['t'] | null {
  return ehObjeto(m) && typeof m.t === 'string' && Object.hasOwn(FORMAS, m.t) ? (m.t as MsgCliente['t']) : null;
}

/** confere a forma de uma mensagem do cliente; devolve o motivo da recusa ou null */
export function validarMsg(m: unknown): string | null {
  if (!ehObjeto(m) || typeof m.t !== 'string') return 'Mensagem inválida';
  if (!Object.hasOwn(FORMAS, m.t)) return 'Mensagem desconhecida';
  return FORMAS[m.t as MsgCliente['t']](m) ? null : 'Mensagem inválida';
}

export type MsgServidor =
  /** `quem`: o seu id de autor (o mesmo das suas mensagens no chat, MsgChat.quem) */
  | { t: 'sala'; sala: SalaPublica; voce: number; token: string; quem: string }
  | { t: 'jogo'; vista: GameView; paradas: StopSettings; posicoes: Posicoes; desfazivel: boolean; desfazer: PedidoDesfazer | null }
  /** aviso curto para a mesa (pedido de desfazer aceito, recusado ou expirado) */
  | { t: 'aviso'; msg: string }
  | { t: 'saiu' }
  /** alguém mostrou uma carta da mão (para quem recebeu e para quem mostrou) */
  | { t: 'revelada'; de: number; def: string; nome: string; para: number[] | 'todos' }
  /** um bot está pensando há mais de um segundo (null: ninguém) */
  | { t: 'pensando'; assento: number | null }
  /** a lista de decks do saguão mudou (deck importado ou atualizado) */
  | { t: 'decks'; decks: DeckResumo[] }
  /** andamento de uma importação ou atualização de deck (null: nenhuma); `mudou`: o catálogo mudou */
  | { t: 'catalogo'; tarefa: TarefaPublica | null; mudou: boolean }
  /** chat da sala: `tudo` traz a conversa guardada inteira (ao entrar ou voltar); sem ele, só as mensagens novas */
  | { t: 'chat'; msgs: MsgChat[]; tudo?: boolean }
  /** resposta ao batimento (`ping`) */
  | { t: 'pong' }
  /** `de`: o tipo da mensagem do cliente que causou o erro (ausente quando o erro não responde a uma mensagem, como
   * o aviso a toda a mesa de um erro do motor numa jogada de bot) */
  | { t: 'erro'; msg: string; de?: MsgCliente['t'] };
