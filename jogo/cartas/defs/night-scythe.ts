// Night Scythe
// Flying
// Invasion Beams — When this Vehicle enters, create a 2/2 black Necron Warrior artifact creature token.
// Crew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, etb, keyword } from '../../motor/api.ts';
import { criaNecronWarriors } from '../necrons.ts';

export default defineCard({
  name: 'Night Scythe',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* criaNecronWarriors(c, 1); }, { text: 'Invasion Beams — Quando este Veículo entra, crie uma ficha de criatura artefato Necron Warrior 2/2 preta.' }),
      crew(2),
    ],
  }],
  rulings: {},
});