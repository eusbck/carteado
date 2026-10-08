// Stormcatch Mentor
// Haste
// Prowess
// Instant and sorcery spells you cast cost {1} less to cast.
import { defineCard, keyword, prowess, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Stormcatch Mentor',
  faces: [{
    abilities: [
      keyword('haste'),
      ...prowess(),
      // rulings 1-2: reduz só o genérico do custo total; valor de mana não muda
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null) },
        text: 'As mágicas instantâneas e de feitiço que você conjura custam {1} a menos.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a redução não paga mana colorida',
    2: 'regra geral: CR 601.2f — custo total; valor de mana não muda',
  },
});
