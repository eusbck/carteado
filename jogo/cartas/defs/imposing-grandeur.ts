// Imposing Grandeur
// Each player may discard their hand and draw cards equal to the greatest mana value of a commander they own on the
// battlefield or in the command zone.
import { defineCard, discard, draw, manaValue, yesNo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

/** maior valor de mana entre os comandantes de que o jogador é dono e que estão no campo ou na zona de comando */
function maiorComandante(g: G, p: PlayerId): number {
  const s = g.state;
  const ids = [...s.zones.battlefield, ...s.zones.command].filter((id) => {
    const o = s.objects[id];
    return !!o && o.owner === p && o.card !== null && s.players[p].commanders.includes(o.card);
  });
  return ids.reduce((m, id) => Math.max(m, manaValue(g, id)), 0);
}

export default defineCard({
  name: 'Imposing Grandeur',
  faces: [{
    spell: {
      *effect(c) {
        // em ordem de turno (CR 101.4): cada jogador decide; quem aceita descarta a mão e compra
        const aceitam: PlayerId[] = [];
        for (const p of c.g.apnap()) {
          const n = maiorComandante(c.g, p);
          if (yield* yesNo(c.g, p, `Imposing Grandeur: descartar a sua mão e comprar ${n} carta${n === 1 ? '' : 's'}?`)) aceitam.push(p);
        }
        for (const p of aceitam) {
          const mao = c.g.state.zones.hand[p].length;
          if (mao > 0) yield* discard(c.g, p, mao);
        }
        for (const p of aceitam) {
          const n = maiorComandante(c.g, p);
          if (n > 0) yield* draw(c.g, p, n);
        }
      },
    },
  }],
  rulings: {},
});
