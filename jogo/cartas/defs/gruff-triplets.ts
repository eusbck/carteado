// Gruff Triplets
// Trample
// When this creature enters, if it isn't a token, create two tokens that are copies of it.
// When this creature dies, put a number of +1/+1 counters equal to its power on each creature you control named Gruff
// Triplets.
import { addCounters, copiableValues, createTokens, creaturesOf, defineCard, etb, keyword, lkiChars, nameOf, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Gruff Triplets',
  faces: [{
    abilities: [
      keyword('trample'),
      etb(function* (c) { yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 2); }, {
        // CR 603.4: cláusula "se" interveniente; as cópias são fichas e não criam outras
        condition: (c) => !(c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.isToken,
        text: 'Quando esta criatura entra, se não for uma ficha, crie duas fichas que são cópias dela.',
      }),
      triggered(on.selfDies(), function* (c) {
        // a força que ela tinha quando estava no campo pela última vez (CR 608.2h)
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        if (x <= 0) return;
        for (const id of creaturesOf(c.g, c.you).filter((i) => nameOf(c.g, i) === 'Gruff Triplets')) addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
      }, { text: 'Quando esta criatura morre, coloque um número de marcadores +1/+1 igual à força dela em cada criatura que você controla com o nome Gruff Triplets.' }),
    ],
  }],
  rulings: {},
});