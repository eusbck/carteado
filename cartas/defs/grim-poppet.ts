// Grim Poppet
// This creature enters with three -1/-1 counters on it.
// Remove a -1/-1 counter from this creature: Put a -1/-1 counter on another target creature.
import { activated, addCounters, defineCard, entersWithCounters, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Grim Poppet',
  faces: [{
    abilities: [
      entersWithCounters('-1/-1', 3),
      activated('Remove a -1/-1 counter from this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { targets: [t.creature(is.other, 'outra criatura alvo')], text: 'Remova um marcador -1/-1 desta criatura: Coloque um marcador -1/-1 em outra criatura alvo.' }),
    ],
  }],
  rulings: { 1: 'teste: pode mirar a mesma criatura várias vezes, nunca a si mesma' },
});
