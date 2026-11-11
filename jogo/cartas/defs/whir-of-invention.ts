// Whir of Invention
// Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities
// pays for {1}.)
// Search your library for an artifact card with mana value X or less, put it onto the battlefield, then shuffle.
import { chars, defineCard, manaValue, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Whir of Invention',
  faces: [{
    // CR 702.126 (motor/costs.ts): os artefatos virados pagam só mana genérica, depois das habilidades de mana
    improvise: true,
    spell: {
      *effect(c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).types.includes('Artifact') && manaValue(c.g, id) <= c.x, 1, 'battlefield', { prompt: `Procure uma carta de artefato com valor de mana ${c.x} ou menos` });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.126b — improvisar não muda o custo de mana nem o valor de mana (motor/costs.ts)',
    2: 'regra geral: CR 702.126a — improvisar vale depois do custo total (motor/stack.ts castSpell)',
    3: 'regra geral: CR 702.126b — improvisar não é custo alternativo (motor/stack.ts castSpell)',
    4: 'teste: com X=2, os artefatos virados pagam o {2}, e o {U}{U}{U} vem das Islands',
    5: 'regra geral: CR 702.126a — só paga o custo de conjurar a mágica (motor/costs.ts)',
    6: 'regra geral: CR 702.126a — o artefato virado para mana não pode ser virado de novo para improvisar (motor/costs.ts)',
    7: 'regra geral: CR 702.126a — virar o artefato não desliga as habilidades dele',
    8: 'regra geral: CR 702.126a — virar o Equipamento não vira a criatura equipada',
    9: 'teste: com X=2, os artefatos virados pagam o {2}, e o {U}{U}{U} vem das Islands',
  },
});
