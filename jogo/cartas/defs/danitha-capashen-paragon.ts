// Danitha Capashen, Paragon
// First strike, vigilance, lifelink
// Aura and Equipment spells you cast cost {1} less to cast.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Danitha Capashen, Paragon',
  faces: [{
    abilities: [
      ...keywords('first strike', 'vigilance', 'lifelink'),
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.subtypes.includes('Aura') || spell.chars.subtypes.includes('Equipment')) ? { reduce: 1 } : null) },
        text: 'As mágicas de Aura e de Equipamento que você conjura custam {1} a menos.',
      }),
    ],
  }],
  rulings: {},
});
