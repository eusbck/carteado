// Pugnacious Hammerskull
// Whenever this creature attacks while you don't control another Dinosaur, put a stun counter on it. (If a permanent
// with a stun counter would become untapped, remove one from it instead.)
import { addCounters, controlledBy, defineCard, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pugnacious Hammerskull',
  faces: [{
    abilities: [
      // a condição é do disparo (sem "se" interveniente): vista ao declarar o ataque, não ao resolver (ruling 1)
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)
        && controlledBy(c.g, c.you, (id) => id !== c.source && isSubtype(c.g, id, 'Dinosaur')).length === 0), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'stun', 1, c.you);
      }, { text: 'Sempre que esta criatura ataca enquanto você não controla outro Dinosaur, coloque um marcador de atordoamento nela.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacando sem outro Dinosaur, recebe um marcador de atordoamento, mesmo que um Dinosaur entre antes de resolver',
  },
});
