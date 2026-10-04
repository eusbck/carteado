// Prismari Charm
// Choose one —
// • Surveil 2, then draw a card.
// • Prismari Charm deals 1 damage to each of one or two targets.
// • Return target nonland permanent to its owner's hand.
import { dealDamage, defineCard, draw, lookAndArrange, modal, returnToHand, t, tgt, tgtRef } from '../../motor/api.ts';

export default defineCard({
  name: 'Prismari Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Vigiar 2, depois compre uma carta', *effect(c) { yield* lookAndArrange(c.g, c.you, 2, 'surveil'); yield* draw(c.g, c.you, 1); } },
        {
          text: 'Causa 1 de dano a cada um de um ou dois alvos', targets: [{ ...t.any('um ou dois alvos'), min: 1, max: 2 }],
          *effect(c) {
            const alvos = (c.targets[0] ?? []).map((_, i) => tgtRef(c, 0, i)).filter((r) => r !== null);
            dealDamage(c.g, alvos.map((r) => ({ source: c.source, target: r!, amount: 1, combat: false })));
          },
        },
        {
          text: 'Devolva o permanente não terreno alvo para a mão do dono', targets: [t.nonlandPermanent()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {},
});
