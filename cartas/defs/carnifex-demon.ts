// Carnifex Demon
// Flying
// This creature enters with two -1/-1 counters on it.
// {B}, Remove a -1/-1 counter from this creature: Put a -1/-1 counter on each other creature.
import { activated, addCounters, allCreatures, defineCard, entersWithCounters, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Carnifex Demon',
  faces: [{
    abilities: [
      keyword('flying'),
      entersWithCounters('-1/-1', 2),
      activated('{B}, Remove a -1/-1 counter from this creature', function* (c) {
        // ruling 1: cada outra criatura, inclusive as suas
        for (const id of allCreatures(c.g)) if (id !== c.source) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { text: '{B}, Remova um marcador -1/-1 desta criatura: Coloque um marcador -1/-1 em cada outra criatura.' }),
    ],
  }],
  rulings: { 1: 'teste: põe em cada outra criatura, inclusive as suas' },
});
