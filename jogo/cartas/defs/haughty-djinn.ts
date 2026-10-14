// Haughty Djinn
// Flying
// Haughty Djinn's power is equal to the number of instant and sorcery cards in your graveyard.
// Instant and sorcery spells you cast cost {1} less to cast.
import { defineCard, keyword, selfGets, staticAbility } from '../../motor/api.ts';
import { instantesEFeiticosNoCemiterio } from '../saque.ts';

export default defineCard({
  name: 'Haughty Djinn',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 604.3: habilidade que define característica, vale em todas as zonas (ruling 1); a resistência impressa é 4
      selfGets((c) => [{ k: 'setPT', p: instantesEFeiticosNoCemiterio(c.g, c.you).length, t: 4 }], 'A força desta criatura é igual ao número de cartas de instantânea e de feitiço no seu cemitério.', { cda: true }),
      // CR 601.2f: reduz só o genérico
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null) },
        text: 'As mágicas instantâneas e de feitiço que você conjura custam {1} a menos.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a força conta as instantâneas e os feitiços do cemitério, também fora do campo',
    2: 'regra geral: a carta é contada uma vez só, mesmo sendo instantânea e feitiço (cartas/saque.ts instantesEFeiticosNoCemiterio)',
  },
});
