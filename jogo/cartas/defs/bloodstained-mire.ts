// Bloodstained Mire
// {T}, Pay 1 life, Sacrifice this land: Search your library for a Swamp or Mountain card, put it onto the battlefield, then
// shuffle.
import { activated, chars, defineCard, searchTo } from '../../motor/api.ts';

const TIPOS = ['Swamp', 'Mountain'];

export default defineCard({
  name: 'Bloodstained Mire',
  faces: [{
    abilities: [
      // qualquer carta com um dos subtipos serve, básica ou não (CR 205.3i, 305.8); entra desvirada
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), 1, 'battlefield', { prompt: 'Procure uma carta de Swamp ou Mountain' });
      }, { text: '{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de Swamp ou Mountain, coloque-a no campo e embaralhe.' }),
    ],
  }],
  rulings: {},
});
