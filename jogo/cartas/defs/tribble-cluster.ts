// Tribble Cluster
// At the beginning of combat on your turn, put a +1/+1 counter on this creature.
// When this creature dies, create X 1/1 white Tribble creature tokens with "This token can't block," where X is this
// creature's power.
import { addCounters, createTokens, defineCard, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tribble Cluster',
  faces: [{
    abilities: [
      triggered(on.beginCombat('you'), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'No início do combate no seu turno, coloque um marcador +1/+1 nesta criatura.' }),
      // CR 603.10a: a força é a que ela tinha ao morrer (última informação conhecida)
      triggered(on.selfDies(), function* (c) {
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        if (x > 0) yield* createTokens(c.g, c.you, 'Tribble', x);
      }, { text: 'Quando esta criatura morre, crie X fichas de criatura Tribble 1/1 brancas com "Esta ficha não pode bloquear", em que X é a força desta criatura.' }),
    ],
  }],
  rulings: {},
});
