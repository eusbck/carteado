// Skinrender
// When this creature enters, put three -1/-1 counters on target creature.
import { addCounters, defineCard, etb, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Skinrender',
  faces: [{
    abilities: [etb(function* (c) {
      const id = tgt(c);
      if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 3, c.you);
    }, {
      // ruling 1: obrigatório; sem outra criatura, mira a si mesma
      targets: [t.creature()],
      text: 'Quando esta criatura entra, coloque três marcadores -1/-1 na criatura alvo.',
    })],
  }],
  rulings: { 1: 'teste: sem outra criatura, mira a si mesma' },
});
