// Transcendent Envoy
// Flying
// Aura spells you cast cost {1} less to cast.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Transcendent Envoy',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Aura') ? { reduce: 1 } : null) },
        text: 'As mágicas de Aura que você conjura custam {1} a menos.',
      }),
    ],
  }],
});
