// Colossal Majesty
// At the beginning of your upkeep, if you control a creature with power 4 or greater, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';
import { temForca4 } from '../dinossauros.ts';

export default defineCard({
  name: 'Colossal Majesty',
  faces: [{
    abilities: [
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (rulings 1-3); compra uma só (ruling 4)
      triggered(on.upkeep('you'), function* (c) { yield* draw(c.g, c.you, 1); }, {
        condition: (c) => temForca4(c.g, c.you),
        text: 'No início da sua manutenção, se você controla uma criatura com força 4 ou mais, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: sem criatura com força 4 ou mais, não dispara',
    2: 'regra geral: CR 603.4 — a condição é conferida de novo ao resolver (motor/triggers.ts)',
    3: 'regra geral: CR 603.4 — basta haver alguma criatura com força 4 ou mais ao resolver, não a mesma (motor/triggers.ts)',
    4: 'teste: na sua manutenção, com uma criatura de força 4 ou mais, compra uma carta só',
  },
});
