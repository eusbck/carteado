// Endless Atlas
// {2}, {T}: Draw a card. Activate only if you control three or more lands with the same name.
import { activated, defineCard, draw } from '../../motor/api.ts';
import { tresTerrenosIguais } from '../necrons.ts';

export default defineCard({
  name: 'Endless Atlas',
  faces: [{
    abilities: [
      activated('{2}, {T}', function* (c) { yield* draw(c.g, c.you, 1); }, {
        condition: (c) => tresTerrenosIguais(c.g, c.you),
        text: '{2}, {T}: Compre uma carta. Ative somente se você controla três ou mais terrenos com o mesmo nome.',
      }),
    ],
  }],
  rulings: {},
});