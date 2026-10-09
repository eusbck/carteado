// Simulação dos bots: aplica uma jogada numa cópia do mundo do bot (bots/mundo.ts) e segue com políticas rápidas até
// um horizonte, depois avalia.
//
// Horizontes: 'pilha' (até a pilha esvaziar, a busca rasa das fases anteriores), 'combate' (até o fim do combate, para
// truques e escolhas de ataque e bloqueio), 'turno' e 'proximo' (até o fim do turno seguinte, para o Magic God).

import { defaultAnswer } from '../motor/ask.ts';
import type { Game } from '../motor/game.ts';
import type { Answer, Decision, PlayerId, Step } from '../motor/types.ts';
import { avaliar, type OpcoesAvaliacao } from './avaliacao.ts';

export { determinizar } from './mundo.ts';

export type Politica = (d: Decision, game: Game) => Answer;
export type Horizonte = 'pilha' | 'combate' | 'turno' | 'proximo';

export interface Resultado {
  valor: number;
  /** respostas que `eu` deu depois da primeira, na ordem (alvos, modos, X, pagamento…) */
  plano: Answer[];
  /** a simulação quebrou neste mundo (erro do motor, ou resposta e resposta padrão recusadas): quem chamou descarta
   *  o mundo, em vez de a decisão inteira cair */
  falhou?: boolean;
}

let falhas = 0;
/** registra no log (do servidor ou da bateria) as primeiras falhas de simulação, e depois uma a cada cem */
export function avisarFalha(onde: string, e: unknown): void {
  falhas++;
  if (falhas <= 5 || falhas % 100 === 0) console.warn(`[bots] ${onde}: mundo descartado (${falhas}ª falha neste processo): ${e instanceof Error ? e.message : String(e)}`);
}

const FORA_DO_COMBATE = new Set<Step>(['endCombat', 'main2', 'end', 'cleanup']);

export interface OpcoesSimulacao {
  horizonte?: Horizonte;
  maxDecisoes?: number;
  avaliacao?: OpcoesAvaliacao;
  /** quem responde às decisões de prioridade de `eu` (padrão: passa, como na busca rasa) */
  minhaPrioridade?: Politica;
}

/**
 * Aplica `primeira` (resposta de `eu` à decisão pendente) e segue com políticas rápidas até o horizonte. Depois avalia.
 * `minha`: as outras decisões de `eu`; `outros`: tudo dos outros jogadores.
 */
export function simular(f: Game, eu: PlayerId, primeira: Answer, minha: Politica, outros: Politica, opts: OpcoesSimulacao | number = {}): Resultado {
  try {
    return simularNoMundo(f, eu, primeira, minha, outros, opts);
  } catch (e) {
    avisarFalha('simulação', e);
    return { valor: NaN, plano: [], falhou: true };
  }
}

function simularNoMundo(f: Game, eu: PlayerId, primeira: Answer, minha: Politica, outros: Politica, opts: OpcoesSimulacao | number): Resultado {
  const o: OpcoesSimulacao = typeof opts === 'number' ? { maxDecisoes: opts } : opts;
  const horizonte = o.horizonte ?? 'pilha';
  const maxDecisoes = o.maxDecisoes ?? (horizonte === 'pilha' ? 160 : horizonte === 'combate' ? 300 : 2500);
  const plano: Answer[] = [];
  const turno = f.state.turn.number;
  // o plano vale até a situação acalmar (pilha vazia): depois disso, nos horizontes longos, já é outro momento
  let planoAberto = true;
  if (!f.pending || !f.answer(eu, primeira).ok) return { valor: -Infinity, plano };
  for (let i = 0; i < maxDecisoes; i++) {
    const d = f.pending;
    if (!d || f.isOver()) break;
    const s = f.state;
    const calmo = d.kind === 'priority' && s.zones.stack.length === 0 && s.pendingTriggers.length === 0;
    if (calmo) planoAberto = false;
    if (horizonte === 'pilha') {
      if (s.turn.number !== turno || calmo) break;
    } else if (horizonte === 'combate') {
      if (s.turn.number !== turno || (calmo && FORA_DO_COMBATE.has(s.turn.step))) break;
    } else if (horizonte === 'turno') {
      if (s.turn.number !== turno) break;
    } else if (s.turn.number > turno + 1) break;
    let a: Answer;
    if (d.player === eu) a = d.kind === 'priority' ? (o.minhaPrioridade ?? outros)(d, f) : minha(d, f);
    else a = outros(d, f);
    if (!f.answer(d.player, a).ok) {
      a = defaultAnswer(d);
      if (!f.answer(d.player, a).ok) return { valor: NaN, plano, falhou: true };
    }
    if (planoAberto && d.player === eu && d.kind !== 'priority') plano.push(a);
  }
  return { valor: avaliar(f.g, eu, o.avaliacao), plano };
}
