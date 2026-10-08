// Village Rites
// As an additional cost to cast this spell, sacrifice a creature.
// Draw two cards.
import { additionalCost, defineCard, draw, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Village Rites',
  faces: [{
    // ruling 1: exatamente uma criatura, obrigatório (CR 118.8)
    additionalCosts: [additionalCost('sacrificar', 'sacrificar uma criatura', [{ k: 'sacrifice', n: 1, filter: is.creature, label: 'uma criatura' }])],
    spell: { *effect(c) { yield* draw(c.g, c.you, 2); } },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada; sacrifica uma só',
  },
});
