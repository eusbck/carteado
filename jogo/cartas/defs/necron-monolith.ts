// Necron Monolith
// Flying, indestructible
// Eternity Gate — Whenever this Vehicle attacks, mill three cards. For each creature card milled this way, create a 2/2
// black Necron Warrior artifact creature token.
// Crew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { chars, crew, defineCard, keywords, mill, on, triggered } from '../../motor/api.ts';
import { criaNecronWarriors } from '../necrons.ts';

export default defineCard({
  name: 'Necron Monolith',
  faces: [{
    abilities: [
      ...keywords('flying', 'indestructible'),
      triggered(on.selfAttacks(), function* (c) {
        const n = (yield* mill(c.g, c.you, 3)).filter((id) => !!c.g.state.objects[id] && chars(c.g, id).types.includes('Creature')).length;
        yield* criaNecronWarriors(c, n);
      }, { text: 'Eternity Gate — Sempre que este Veículo ataca, triture três cartas. Para cada carta de criatura triturada assim, crie uma ficha de criatura artefato Necron Warrior 2/2 preta.' }),
      crew(4),
    ],
  }],
  rulings: {},
});