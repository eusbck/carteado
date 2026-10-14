// Sage of the Beyond
// Flying
// Spells you cast from anywhere other than your hand cost {2} less to cast.
// Foretell {4}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later
// turn for its foretell cost.)
import { defineCard, foretell, keyword, staticAbility } from '../../motor/api.ts';

const predizer = foretell('{4}{U}');

export default defineCard({
  name: 'Sage of the Beyond',
  faces: [{
    // CR 702.143a: conjurar a carta predita do exílio pelo custo de predizer
    altCosts: [predizer.altCost],
    abilities: [
      keyword('flying'),
      // rulings 1-2: reduz só o genérico do custo total (CR 601.2f)
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && sp.castFrom !== 'hand' ? { reduce: 2 } : null) },
        text: 'As mágicas que você conjura de qualquer lugar que não seja a sua mão custam {2} a menos para serem conjuradas.',
      }),
      predizer.ability,
    ],
  }],
  rulings: {
    1: 'teste: uma mágica conjurada do cemitério custa {2} a menos; da mão, não',
    2: 'teste: a redução não paga mana colorida',
    3: 'regra geral: CR 116.2h, 702.143b — predizer é ação especial, feita com prioridade no seu turno (testes/regras-predizer.test.ts)',
    4: 'teste: a carta predita só pode ser conjurada depois do turno em que foi predita, pelo custo de predizer',
    5: 'regra geral: CR 118.9a, 601.2b — pelo custo de predizer, não se escolhe outro custo alternativo; custos adicionais continuam (motor/stack.ts)',
  },
});
