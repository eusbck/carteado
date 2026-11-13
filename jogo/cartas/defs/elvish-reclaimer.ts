// Elvish Reclaimer
// This creature gets +2/+2 as long as there are three or more land cards in your graveyard.
// {2}, {T}, Sacrifice a land: Search your library for a land card, put it onto the battlefield tapped, then shuffle.
import { activated, defineCard, isLand, searchTo, selfGets } from '../../motor/api.ts';
import { terrenosNoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Elvish Reclaimer',
  faces: [{
    abilities: [
      selfGets(() => [{ k: 'pt', p: 2, t: 2 }], 'Esta criatura recebe +2/+2 enquanto houver três ou mais cartas de terreno no seu cemitério.', {
        condition: (c) => terrenosNoCemiterio(c, c.you).length >= 3,
      }),
      activated('{2}, {T}, Sacrifice a land', function* (c) {
        yield* searchTo(c, c.you, (id) => isLand(c.g, id), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de terreno' });
      }, { text: '{2}, {T}, Sacrifique um terreno: Procure no seu grimório uma carta de terreno, coloque-a no campo virada e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
