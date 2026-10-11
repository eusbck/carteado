// Vibranium Mining Mech
// Trample
// Whenever this Vehicle enters or attacks, create a tapped Vibranium token. (It's an artifact with indestructible and
// "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")
// {2}: This Vehicle gets +1/+0 until end of turn.
// Crew 2
import { activated, crew, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { bombeia } from '../inferno.ts';
import { criaVibraniumVirado } from '../wakanda.ts';

export default defineCard({
  name: 'Vibranium Mining Mech',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        yield* criaVibraniumVirado(c);
      }, { text: 'Sempre que este Vehicle entra ou ataca, crie uma ficha de Vibranium virada.' }),
      activated('{2}', function* (c) { bombeia(c, 1, 0); }, { text: '{2}: Este Vehicle recebe +1/+0 até o fim do turno.' }),
      crew(2),
    ],
  }],
  rulings: {},
});