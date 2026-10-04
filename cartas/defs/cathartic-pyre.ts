// Cathartic Pyre
// Choose one —
// • Cathartic Pyre deals 3 damage to target creature or planeswalker.
// • Discard up to two cards, then draw that many cards.
import { dealDamage, defineCard, discard, draw, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cathartic Pyre',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Causa 3 de dano à criatura ou planeswalker alvo', targets: [t.creatureOrPlaneswalker()],
          *effect(c) { const id = tgt(c); if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 3, combat: false }]); },
        },
        {
          text: 'Descarte até duas cartas e compre esse número de cartas',
          *effect(c) {
            const d = yield* discard(c.g, c.you, 2, { upTo: true });
            yield* draw(c.g, c.you, d.length);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
