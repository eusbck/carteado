// Dragonspeaker Shaman
// Dragon spells you cast cost {2} less to cast.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Dragonspeaker Shaman',
  faces: [{
    abilities: [
      // CR 601.2f: reduz só a parte genérica do custo total
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Dragon') ? { reduce: 2 } : null) },
        text: 'As mágicas de Dragon que você conjura custam {2} a menos.',
      }),
    ],
  }],
  rulings: {},
});
