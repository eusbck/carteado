// Stitcher's Supplier
// When this creature enters or dies, mill three cards.
import { defineCard, etb, mill, on, triggered } from '../../motor/api.ts';

function* moer(c: Parameters<Parameters<typeof etb>[0]>[0]) { yield* mill(c.g, c.you, 3); }

export default defineCard({
  name: "Stitcher's Supplier",
  faces: [{
    abilities: [
      etb(moer, { text: 'Quando esta criatura entra, moa três cartas.' }),
      triggered(on.selfDies(), moer, { text: 'Quando esta criatura morre, moa três cartas.' }),
    ],
  }],
  rulings: {},
});
