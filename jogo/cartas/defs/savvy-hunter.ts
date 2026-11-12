// Savvy Hunter
// Whenever this creature attacks or blocks, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this
// token: You gain 3 life.")
// Sacrifice two Foods: Draw a card.
import { activated, createTokens, defineCard, draw, on, triggered } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Savvy Hunter',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)) || (e.type === 'blockers' && e.blocks.some(([b]) => b === c.source))), function* (c) {
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, { text: 'Sempre que esta criatura ataca ou bloqueia, crie uma ficha Food.' }),
      activated('Sacrifice two Foods', function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sacrifique duas Foods: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
  },
});
