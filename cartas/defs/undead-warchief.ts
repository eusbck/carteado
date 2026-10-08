// Undead Warchief
// Zombie spells you cast cost {1} less to cast.
// Zombie creatures you control get +2/+1.
import { and, anthem, defineCard, is, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Undead Warchief',
  faces: [{
    abilities: [
      // reduz só a parte genérica do custo total (CR 601.2f, 118.7a)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Zombie') ? { reduce: 1 } : null) },
        text: 'As mágicas de Zombie que você conjura custam {1} a menos.',
      }),
      anthem(and(is.creature, is.subtype('Zombie'), is.yours), () => [{ k: 'pt', p: 2, t: 1 }], 'As criaturas Zombie que você controla recebem +2/+1.'),
    ],
  }],
  rulings: {},
});
