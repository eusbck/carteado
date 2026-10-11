// Weathered Wayfarer
// {W}, {T}: Search your library for a land card, reveal it, put it into your hand, then shuffle. Activate only if an
// opponent controls more lands than you.
import { activated, defineCard, isLand, searchTo } from '../../motor/api.ts';
import { oponenteComMaisTerrenos } from '../esquisitos.ts';

export default defineCard({
  name: 'Weathered Wayfarer',
  faces: [{
    abilities: [
      activated('{W}, {T}', function* (c) {
        yield* searchTo(c, c.you, (id) => isLand(c.g, id), 1, 'hand', { reveal: true, prompt: 'Weathered Wayfarer: escolha uma carta de terreno' });
      }, {
        // restrição de ativação: conferida só ao ativar (CR 602.5b)
        condition: (c) => oponenteComMaisTerrenos(c.g, c.you),
        text: '{W}, {T}: Procure no seu grimório uma carta de terreno, revele-a, coloque-a na sua mão e depois embaralhe. Ative só se um oponente controlar mais terrenos que você.',
      }),
    ],
  }],
  rulings: {},
});
