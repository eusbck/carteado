// Dragonlord's Servant
// Dragon spells you cast cost {1} less to cast.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Dragonlord's Servant",
  faces: [{
    abilities: [
      // CR 601.2f: reduz só a parte genérica do custo total (com custos adicionais e alternativos já somados)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Dragon') ? { reduce: 1 } : null) },
        text: 'As mágicas de Dragon que você conjura custam {1} a menos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f, 118.7a — o valor de mana da mágica não muda (motor/stack.ts)',
    2: 'teste: não reduz mana colorida',
    3: 'teste: não reduz mana colorida',
    4: 'regra geral: CR 601.2f — custos adicionais são somados antes das reduções (motor/stack.ts)',
    5: 'regra geral: CR 601.2f — a redução vale também para custos alternativos (motor/stack.ts)',
    6: 'regra geral: CR 601.2f, 118.7a — aumentos antes das reduções; valor de mana inalterado (motor/stack.ts)',
  },
});
