// Belladonna Took
// Whenever a token you control enters, you gain 1 life if this is the first time this ability has resolved this turn.
// If it's the second time, draw a card. If it's the third time, put a +1/+1 counter on each creature you control.
import { addCounters, and, creaturesOf, defineCard, draw, gainLife, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Belladonna Took',
  faces: [{
    abilities: [
      // conta as resoluções desta habilidade no turno (no objeto: outra Belladonna, ou esta de volta, conta de novo)
      triggered(on.enters(and(is.token, is.yours)), function* (c) {
        const o = c.g.state.objects[c.source];
        const turno = c.g.state.turn.number;
        let vez = 1;
        if (o) {
          const antes = o.data.belladonna as { turno: number; n: number } | undefined;
          vez = antes?.turno === turno ? antes.n + 1 : 1;
          o.data.belladonna = { turno, n: vez };
        }
        if (vez === 1) gainLife(c.g, c.you, 1, c.source);
        else if (vez === 2) yield* draw(c.g, c.you, 1);
        else if (vez === 3) for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma ficha que você controla entra, você ganha 1 ponto de vida se for a primeira vez que esta habilidade resolve neste turno. Se for a segunda vez, compre uma carta. Se for a terceira vez, coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: a primeira resolução no turno dá 1 de vida, a segunda compra, a terceira põe marcadores, a quarta não faz nada',
  },
});
