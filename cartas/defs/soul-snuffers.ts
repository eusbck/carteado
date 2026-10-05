// Soul Snuffers
// When this creature enters, put a -1/-1 counter on each creature.
import { addCounters, allCreatures, defineCard, etb } from '../../motor/api.ts';

export default defineCard({
  name: 'Soul Snuffers',
  faces: [{
    abilities: [etb(function* (c) {
      // ruling 1: inclusive nela mesma
      for (const id of allCreatures(c.g)) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
    }, { text: 'Quando esta criatura entra, coloque um marcador -1/-1 em cada criatura.' })],
  }],
  rulings: { 1: 'teste: põe um marcador nela mesma também' },
});
