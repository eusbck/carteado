// Rocky Tar Pit
// This land enters tapped.
// {T}, Sacrifice this land: Search your library for a Swamp or Mountain card, put it onto the battlefield, then shuffle.
import { activated, chars, defineCard, land, searchTo } from '../../motor/api.ts';

const TIPOS = ['Swamp', 'Mountain'];

export default defineCard({
  name: 'Rocky Tar Pit',
  faces: [{
    abilities: [
      land.tapped(),
      // qualquer carta com um dos subtipos serve, básica ou não (CR 205.3i, 305.8); entra desvirada
      activated('{T}, Sacrifice this land', function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), 1, 'battlefield', { prompt: 'Procure uma carta de Swamp ou Mountain' });
      }, { text: '{T}, Sacrifique este terreno: Procure uma carta de Swamp ou Mountain, coloque-a no campo e embaralhe.' }),
    ],
  }],
  rulings: { 1: 'teste: a busca pode não achar nada' },
});
