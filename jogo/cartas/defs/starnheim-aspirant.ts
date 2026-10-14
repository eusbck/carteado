// Starnheim Aspirant
// Angel spells you cast cost {2} less to cast.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Starnheim Aspirant',
  faces: [{
    abilities: [
      // rulings 1-3: só o genérico; "mágica de Angel" é mágica de criatura com o tipo Angel
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && sp.chars.types.includes('Creature') && sp.chars.subtypes.includes('Angel') ? { reduce: 2 } : null) },
        text: 'As mágicas de Angel que você conjura custam {2} a menos para serem conjuradas.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — muda só o custo total, não o valor de mana (motor/stack.ts totalSpellCost)',
    2: 'teste: reduz só o genérico',
    3: 'teste: só mágicas de criatura Angel',
  },
});
