// Managorger Hydra
// Trample
// Whenever a player casts a spell, put a +1/+1 counter on this creature.
import { addCounters, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Managorger Hydra',
  faces: [{
    abilities: [
      keyword('trample'),
      // ruling 1: resolve antes da mágica que o disparou
      triggered(on.custom((e) => e.type === 'cast'), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um jogador conjura uma mágica, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: qualquer jogador que conjura uma mágica dá um marcador +1/+1, antes de a mágica resolver',
  },
});
