// White Sun's Zenith
// Create X 2/2 white Cat creature tokens. Shuffle White Sun's Zenith into its owner's library.
import { createTokens, defineCard, moveObjects, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: "White Sun's Zenith",
  faces: [{
    spell: {
      *effect(c) {
        if (c.x > 0) yield* createTokens(c.g, c.you, 'Cat', c.x);
        // ruling 1: só se a mágica resolver; anulada, vai para o cemitério. A cópia simplesmente deixa de existir
        const o = c.g.state.objects[c.source];
        if (o?.zone === 'stack' && !o.isCopy) {
          const dono = o.owner;
          yield* moveObjects(c.g, [{ id: c.source, to: 'library' }], 'effect');
          shuffleLibrary(c.g, dono);
        }
      },
    },
  }],
  rulings: {
    1: 'teste: cria X Cats 2/2 e é embaralhada no grimório do dono; anulada, vai para o cemitério',
  },
});
