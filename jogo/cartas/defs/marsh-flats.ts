// Marsh Flats
// {T}, Pay 1 life, Sacrifice this land: Search your library for a Plains or Swamp card, put it onto the battlefield, then
// shuffle.
import { activated, chars, defineCard, searchTo } from '../../motor/api.ts';

const TIPOS = ['Plains', 'Swamp'];

export default defineCard({
  name: 'Marsh Flats',
  faces: [{
    abilities: [
      // qualquer carta com um dos subtipos serve, básica ou não (CR 205.3i, 305.8); entra desvirada
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), 1, 'battlefield', { prompt: 'Procure uma carta de Plains ou Swamp' });
      }, { text: '{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de Plains ou Swamp, coloque-a no campo e embaralhe.' }),
    ],
  }],
  rulings: {},
});
