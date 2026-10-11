// Taurean Mauler
// Changeling (This card is every creature type.)
// Whenever an opponent casts a spell, you may put a +1/+1 counter on this creature.
import { addCounters, changeling, defineCard, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Taurean Mauler',
  faces: [{
    abilities: [
      // CR 702.73a: polimorfo
      changeling(),
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player)), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (yield* yesNo(c.g, c.you, 'Taurean Mauler: colocar um marcador +1/+1 nele?')) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um oponente conjura uma mágica, você pode colocar um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica do oponente, mesmo que ela seja anulada',
  },
});
