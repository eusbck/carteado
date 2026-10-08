// Wall of Roots
// Defender
// Put a -0/-1 counter on this creature: Add {G}. Activate only once each turn.
import { defineCard, keyword, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Wall of Roots',
  faces: [{
    abilities: [
      keyword('defender'),
      // CR 605.1a: habilidade de mana sem {T} — pode ser ativada mesmo com enjoo de invocação e no turno dos outros
      mana('G', { cost: 'Put a -0/-1 counter on this creature', oncePerTurn: true, text: 'Coloque um marcador -0/-1 nesta criatura: Adicione {G}. Ative só uma vez por turno.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 601.2g — mana ativada antes de pagar; pode ir a 0 de resistência e ser sacrificada no mesmo pagamento' },
});
