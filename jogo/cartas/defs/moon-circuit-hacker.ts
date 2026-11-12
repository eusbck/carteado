// Moon-Circuit Hacker
// Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand
// tapped and attacking.)
// Whenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card unless this
// creature entered this turn.
import { defineCard, discard, draw, ninjutsu, on, triggered, yesNo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';
import { NINJUTSU } from '../ninjas.ts';

/** o permanente entrou no campo neste turno? (state.enteredThisTurn) */
function entrouNesteTurno(g: G, id: ObjId): boolean {
  const s = g.state;
  return s.enteredThisTurn?.turn === s.turn.number && s.enteredThisTurn.objs.includes(id);
}

export default defineCard({
  name: 'Moon-Circuit Hacker',
  faces: [{
    abilities: [
      ninjutsu('{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Moon-Circuit Hacker: comprar uma carta?'))) return;
        const compradas = yield* draw(c.g, c.you, 1);
        // "se fizer isso": só descarta se comprou de fato
        if (compradas.length === 0) return;
        if (!entrouNesteTurno(c.g, c.source)) yield* discard(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode comprar uma carta. Se fizer isso, descarte uma carta, a menos que esta criatura tenha entrado neste turno.' }),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: NINJUTSU.mesmoJogador,
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
    7: 'não se aplica: piada da carta (sem regra)',
  },
});
