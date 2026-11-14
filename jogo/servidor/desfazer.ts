// Desfazer com aceite da mesa (mesa amigável): acha um ponto de volta da pessoa, refaz a partida até antes dele (pelas
// entradas gravadas, sem mexer nas regras do motor) e descreve o que volta.
//
// Pontos de volta de uma pessoa, do começo do turno dela mais recente até agora:
//  - cada jogada dela (conjurar, jogar terreno, ativar, passar clicando, atacar, bloquear, responder uma escolha);
//  - no turno dela, o começo de cada etapa em que recebeu a prioridade, mesmo que a mesa tenha passado sozinha;
//  - o começo do turno dela (a primeira decisão dela no turno).
// "Voltar um passo" vai ao ponto mais recente; pedindo de novo, ao anterior. "Voltar ao começo do turno" vai direto ao
// começo do turno dela, inclusive depois de ela já ter passado o turno (os outros voltam junto, com o aceite deles).

import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import { STEP_NAMES } from '../motor/turn.ts';
import type { GameConfig, PlayerId, PriorityAction, Step } from '../motor/types.ts';
import type { LinhaDesfeita } from './protocolo.ts';

/** de cada entrada: em que turno e etapa aconteceu, de quem era o turno e se foi a pessoa (não o passe automático nem um bot) */
export interface MetaEntrada {
  turno: number;
  humana: boolean;
  /** de quem era o turno (as entradas gravadas antes de existir este campo não têm) */
  ativo?: PlayerId;
  etapa?: Step;
}

/** respostas que começam uma jogada; as que vêm logo depois (alvos, pagamento…) fazem parte dela */
const INICIO_DE_JOGADA = new Set(['priority', 'attackers', 'blockers']);

export type ModoVolta = 'passo' | 'turno';

/** um ponto para onde a pessoa pode voltar: a partida como estava logo antes da entrada `alvo` */
export interface PontoVolta {
  alvo: number;
  /** jogada dela; começo de uma etapa do turno dela; começo do turno dela */
  tipo: 'jogada' | 'etapa' | 'turno';
  etapa?: Step;
}

/** quantos turnos para trás, no máximo, a busca pelo último turno da pessoa olha (6 lugares + folga) */
const TURNOS_PROCURA = 8;

/**
 * Os pontos de volta da pessoa, do mais antigo ao mais recente, e o começo do turno dela (se há). Vale do começo do
 * turno dela mais recente (o atual, se é a vez dela; senão o último que ela jogou) até agora. Partidas gravadas antes
 * de as entradas saberem de quem era o turno: só as jogadas dela no turno atual, como antes.
 */
export function pontosDeVolta(inputs: Input[], metas: (MetaEntrada | null)[], jogador: PlayerId, turnoAtual: number, ativoAtual: PlayerId): { pontos: PontoVolta[]; turno: PontoVolta | null } {
  const nada = { pontos: [], turno: null };
  if (turnoAtual < 1) return nada; // nada antes do primeiro turno (mão inicial)
  // o turno de referência: o atual, se é dela; senão o último em que ela era a jogadora ativa
  let turnoRef = turnoAtual;
  if (ativoAtual !== jogador) {
    for (let k = inputs.length - 1; k >= 0; k--) {
      const m = metas[k];
      if (!m || m.turno < 1 || m.turno < turnoAtual - TURNOS_PROCURA) break;
      if (m.ativo === jogador) { turnoRef = m.turno; break; }
    }
  }
  // o começo da janela: a primeira entrada do turno de referência
  let inicio = inputs.length;
  for (let k = inputs.length - 1; k >= 0; k--) {
    const m = metas[k];
    if (!m || m.turno < turnoRef) break;
    inicio = k;
  }
  // alguém saiu da partida depois: voltar traria a pessoa de volta
  for (let k = inputs.length - 1; k >= inicio; k--) if (inputs[k].t === 'concede') { inicio = k + 1; break; }

  const dela = (k: number) => { const x = inputs[k]; return x.t === 'a' && x.p === jogador; };
  const pontos: PontoVolta[] = [];
  let turno: PontoVolta | null = null;
  const etapasVistas = new Set<string>();
  for (let k = inicio; k < inputs.length; k++) {
    if (!dela(k)) continue;
    const m = metas[k]!;
    const x = inputs[k] as Extract<Input, { t: 'a' }>;
    // no turno dela, a primeira decisão de cada etapa (a primeira de todas é o começo do turno)
    let etapa: 'turno' | 'etapa' | null = null;
    if (m.ativo === jogador && m.etapa) {
      const chave = `${m.turno}:${m.etapa}`;
      if (!etapasVistas.has(chave)) {
        etapa = etapasVistas.size === 0 && m.turno === turnoRef ? 'turno' : 'etapa';
        etapasVistas.add(chave);
      }
    }
    // jogada dela: começa numa prioridade, ataque ou bloqueio, ou é uma resposta solta (uma escolha, sem jogada antes)
    const jogada = m.humana && (INICIO_DE_JOGADA.has(x.a.kind) || !(k > inicio && dela(k - 1) && metas[k - 1]?.humana));
    // a mesma entrada pode ser as duas coisas: o passo leva o nome da jogada; o começo do turno vale à parte
    const tipo = jogada ? 'jogada' : etapa;
    const comEtapa = m.etapa ? { etapa: m.etapa } : {};
    if (etapa === 'turno') turno = { alvo: k, tipo: 'turno', ...comEtapa };
    if (tipo) pontos.push({ alvo: k, tipo, ...comEtapa });
  }
  return { pontos, turno };
}

/** o ponto de um pedido: o mais recente (um passo) ou o começo do turno */
export function alvoDesfazer(inputs: Input[], metas: (MetaEntrada | null)[], jogador: PlayerId, turnoAtual: number, ativoAtual: PlayerId, modo: ModoVolta = 'passo'): PontoVolta | null {
  const { pontos, turno } = pontosDeVolta(inputs, metas, jogador, turnoAtual, ativoAtual);
  return modo === 'turno' ? turno : pontos[pontos.length - 1] ?? null;
}

/** o nome curto de um ponto, para o botão e o pedido ("voltar para o começo da manutenção") */
export function rotuloVolta(p: PontoVolta): string {
  if (p.tipo === 'turno') return 'voltar para o começo do seu turno';
  if (p.tipo === 'etapa' && p.etapa) return `voltar para ${artigo(p.etapa)} ${STEP_NAMES[p.etapa]} do seu turno`;
  return 'desfazer a última jogada';
}

const FEMININAS = new Set<Step>(['upkeep', 'draw', 'main1', 'main2', 'end', 'cleanup']);
function artigo(s: Step): string {
  if (s === 'untap' || s === 'declareAttackers' || s === 'declareBlockers') return 'a etapa de';
  return FEMININAS.has(s) ? 'a' : 'o';
}

/** a partida como estava logo antes da entrada `alvo`, a partir do checkpoint mais próximo */
export function reconstruir(config: GameConfig, decks: DeckList[], inputs: Input[], checkpoints: (Checkpoint | null)[], alvo: number): Game {
  const prefixo = inputs.slice(0, alvo);
  const cp = checkpoints.filter((c): c is Checkpoint => !!c && c.inputIndex <= alvo).sort((a, b) => b.inputIndex - a.inputIndex)[0];
  return cp ? Game.fromCheckpoint(cp, decks, prefixo) : Game.replay(config, decks, prefixo);
}

/** a jogada sem citar a carta (a ação é sobre uma carta que os outros não veem) */
const SEM_A_CARTA: Record<PriorityAction['kind'], string> = {
  pass: 'passa a prioridade', play: 'joga um terreno', cast: 'conjura uma mágica', activate: 'ativa uma habilidade',
  mana: 'gera mana', special: 'faz uma ação especial', manual: 'faz um ajuste manual',
};

/** a carta da ação está onde nem todos a veem (mão, grimório, virada para baixo) antes da jogada */
function cartaOculta(voltar: Game, acao: PriorityAction): boolean {
  if (acao.obj === undefined) return false;
  const o = voltar.state.objects[acao.obj];
  return !!o && (o.zone === 'hand' || o.zone === 'library' || o.faceDown);
}

/** no máximo tantas linhas no pedido; o resto vira "e mais N" */
const LINHAS_MAX = 10;

/**
 * O que volta: a jogada da pessoa (ou, voltando a uma etapa ou ao começo do turno, para onde volta) e, depois, o que
 * aparece no registro para todos. O pedido vai para a mesa inteira: o rótulo da ação (feito para quem joga: "Conjurar
 * Lightning Bolt") só cita a carta se ela estava à vista de todos; senão, sai só o tipo da jogada (uma mágica conjurada
 * e depois cancelada não aparece no registro, e o rótulo entregava a carta da mão).
 */
export function linhasDesfeitas(atual: Game, voltar: Game, entrada: Input, ponto?: PontoVolta): LinhaDesfeita[] {
  const nomes = voltar.state.players.map((p) => p.name);
  const quem = entrada.t === 'a' ? entrada.p : -1;
  const linhas: LinhaDesfeita[] = [];
  const d = voltar.pending;
  const daJogada = !ponto || ponto.tipo === 'jogada';
  if (!daJogada && quem >= 0) {
    const r = rotuloVolta(ponto!);
    linhas.push({ texto: `${nomes[quem]} quer ${r.replace('do seu turno', 'do próprio turno')}`, outro: false });
  } else if (entrada.t === 'a' && d && d.player === quem) {
    const a = entrada.a;
    let texto: string | null = null;
    if (a.kind === 'priority' && d.kind === 'priority') {
      const acao = d.actions.find((x) => x.id === a.action);
      texto = a.action === 'pass' ? `${nomes[quem]} passa a prioridade`
        : !acao ? null
        : cartaOculta(voltar, acao) ? `${nomes[quem]} ${SEM_A_CARTA[acao.kind]}`
        : `${nomes[quem]}: ${acao.label}`;
    } else if (a.kind === 'attackers') texto = `${nomes[quem]} declara ${a.attacks.length ? `ataque com ${a.attacks.length}` : 'que não ataca'}`;
    else if (a.kind === 'blockers') texto = `${nomes[quem]} declara ${a.blocks.length ? `bloqueio com ${a.blocks.length}` : 'que não bloqueia'}`;
    if (texto) linhas.push({ texto, outro: false });
  }
  const resto: LinhaDesfeita[] = [];
  for (const e of atual.state.log.slice(voltar.state.log.length)) {
    const texto = e.visibleTo === null ? e.text : e.hiddenText;
    if (!texto || /^Turno \d+:/.test(texto)) continue;
    const autor = nomes.findIndex((n) => texto.startsWith(`${n} `) || texto.startsWith(`${n}:`));
    resto.push({ texto, outro: autor >= 0 && autor !== quem });
  }
  linhas.push(...resto);
  // conjurar, jogar ou ativar já aparecem no registro do jeito de sempre ("Ana conjura…"): a descrição sai
  const passe = entrada.t === 'a' && entrada.a.kind === 'priority' && entrada.a.action === 'pass';
  if (daJogada && !passe && linhas.length > 1 && !linhas[0].outro && linhas.slice(1).some((l) => !l.outro)) linhas.shift();
  if (linhas.length <= LINHAS_MAX) return linhas;
  const fora = linhas.length - (LINHAS_MAX - 1);
  return [...linhas.slice(0, LINHAS_MAX - 1), { texto: `… e mais ${fora} ${fora === 1 ? 'coisa' : 'coisas'}`, outro: false }];
}

