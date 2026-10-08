// Splatter Technique
// Choose one —
// • Draw four cards.
// • Splatter Technique deals 4 damage to each creature and planeswalker.
import { dealDamage, defineCard, draw, isCreature, isType, modal, permanentsMatching } from '../../motor/api.ts';

export default defineCard({
  name: 'Splatter Technique',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Compre quatro cartas', *effect(c) { yield* draw(c.g, c.you, 4); } },
        {
          text: 'Causa 4 de dano a cada criatura e planeswalker',
          *effect(c) {
            const ids = permanentsMatching(c.g, (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'));
            dealDamage(c.g, ids.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 4, combat: false })));
          },
        },
      ]),
    },
  }],
  rulings: {},
});
