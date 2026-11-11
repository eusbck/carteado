// Diabolic Intent
// As an additional cost to cast this spell, sacrifice a creature.
// Search your library for a card, put that card into your hand, then shuffle.
import { defineCard, isCreature, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Diabolic Intent',
  faces: [{
    additionalCosts: [{ key: 'sacrificar', label: 'sacrificar uma criatura', optional: false, parts: [{ k: 'sacrifice', n: 1, filter: (c, id) => isCreature(c.g, id), label: 'uma criatura' }] }],
    spell: { *effect(c) { yield* searchTo(c, c.you, () => true, 1, 'hand', { prompt: 'Procure uma carta' }); } },
  }],
  rulings: {
    1: 'regra geral: CR 601.2h — sem criatura para sacrificar, não dá para conjurar',
    2: 'regra geral: CR 701.23b — pode não achar a carta',
    3: 'regra geral: CR 601.2h — a criatura vai embora mesmo se a mágica for anulada',
    4: 'regra geral: CR 701.21a — pode sacrificar uma criatura indestrutível',
    5: 'regra geral: CR 401.2 — a carta procurada não é revelada',
  },
});
