// Busca rasa dos bots: cópia determinizada da partida e simulação de uma jogada até a pilha esvaziar.
//
// Determinização: o bot não conhece a mão nem a ordem do grimório dos oponentes, nem a ordem do próprio grimório.
// A cópia redistribui ao acaso as cartas escondidas de cada oponente entre mão e grimório (mantendo as quantidades) e
// embaralha o próprio grimório. Como o conjunto das cartas escondidas de um oponente é o que a lista do deck dele (que
// é conhecida na mesa) tem menos o que já apareceu, isso não usa nada que o bot não poderia saber.

import { defaultAnswer } from '../motor/ask.ts';
import type { Game } from '../motor/game.ts';
import { seedFrom, shuffle, type RngState } from '../motor/rng.ts';
import type { Answer, Decision, PlayerId } from '../motor/types.ts';
import { avaliar } from './avaliacao.ts';

/** cópia da partida (numa decisão de prioridade) com a informação oculta sorteada para `eu` */
export function determinizar(game: Game, eu: PlayerId, rng: RngState): Game {
  const s = game.state;
  // o registro não importa para a simulação e é a maior parte do estado
  const log = s.log;
  s.log = [];
  let f: Game;
  try { f = game.fork(); } finally { s.log = log; }
  const st = f.state;
  for (const p of st.players) {
    if (p.id === eu) { shuffle(rng, st.zones.library[eu]); continue; }
    const mao = st.zones.hand[p.id].length;
    const monte = shuffle(rng, [...st.zones.hand[p.id], ...st.zones.library[p.id]]);
    st.zones.hand[p.id] = monte.slice(0, mao);
    st.zones.library[p.id] = monte.slice(mao);
    for (const id of st.zones.hand[p.id]) st.objects[id].zone = 'hand';
    for (const id of st.zones.library[p.id]) st.objects[id].zone = 'library';
  }
  // o futuro aleatório da partida também é desconhecido
  st.rng = seedFrom(`sim:${rng.join(':')}`);
  return f;
}

export type Politica = (d: Decision, game: Game) => Answer;

export interface Resultado {
  valor: number;
  /** respostas que `eu` deu depois da primeira, na ordem (alvos, modos, X, pagamento…) */
  plano: Answer[];
}

/**
 * Aplica `primeira` (resposta de `eu` à decisão pendente) e segue com políticas rápidas até a situação acalmar:
 * pilha vazia, sem gatilhos esperando e alguém com prioridade. Depois avalia.
 */
export function simular(f: Game, eu: PlayerId, primeira: Answer, minha: Politica, outros: Politica, maxDecisoes = 160): Resultado {
  const plano: Answer[] = [];
  const turno = f.state.turn.number;
  if (!f.pending || !f.answer(eu, primeira).ok) return { valor: -Infinity, plano };
  for (let i = 0; i < maxDecisoes; i++) {
    const d = f.pending;
    if (!d || f.isOver()) break;
    if (f.state.turn.number !== turno) break;
    if (d.kind === 'priority' && f.state.zones.stack.length === 0 && f.state.pendingTriggers.length === 0) break;
    const meu = d.player === eu && d.kind !== 'priority';
    let a = meu ? minha(d, f) : outros(d, f);
    if (!f.answer(d.player, a).ok) {
      a = defaultAnswer(d);
      if (!f.answer(d.player, a).ok) return { valor: -Infinity, plano };
    }
    if (meu) plano.push(a);
  }
  return { valor: avaliar(f.g, eu), plano };
}
