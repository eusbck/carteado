// Black Sun's Zenith
// Put X -1/-1 counters on each creature. Shuffle Black Sun's Zenith into its owner's library.
import { addCounters, allCreatures, defineCard, moveObjects, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: "Black Sun's Zenith",
  faces: [{
    spell: {
      *effect(c) {
        if (c.x > 0) for (const id of allCreatures(c.g)) addCounters(c.g, { kind: 'obj', id }, '-1/-1', c.x, c.you);
        // a própria mágica vai para o grimório do dono (CR 608.2n não se aplica: ela já saiu da pilha)
        const dono = c.g.state.objects[c.source]?.owner;
        if (dono === undefined) return;
        yield* moveObjects(c.g, [{ id: c.source, to: 'library' }], 'shuffle');
        shuffleLibrary(c.g, dono);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 701.6 — anulada, vai para o cemitério' },
});
