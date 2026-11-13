// Genesis Device
// When Genesis Device enters, search your library for a basic land card or Planet card, put it onto the battlefield
// tapped, then shuffle.
// {3}{G}{G}, {T}, Sacrifice Genesis Device: Sacrifice any number of lands you control, then search your library for up
// to that many land cards, put them onto the battlefield tapped, then shuffle. Activate only as a sorcery.
import { activated, chars, chooseItems, defineCard, etb, nameOf, objItem, sacrifice, searchTo } from '../../motor/api.ts';
import { basico, buscaTerrenos, terrenosDe } from '../terras.ts';

export default defineCard({
  name: 'Genesis Device',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => (chars(c.g, id).types.includes('Land') && basico(c.g, id)) || chars(c.g, id).subtypes.includes('Planet'), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de terreno básico ou de Planet' });
      }, { text: 'Quando Genesis Device entra, procure uma carta de terreno básico ou uma carta de Planet, coloque-a no campo virada e depois embaralhe.' }),
      activated('{3}{G}{G}, {T}, Sacrifice this artifact', function* (c) {
        const terras = terrenosDe(c.g, c.you);
        const ids = terras.length ? yield* chooseItems(c.g, c.you, 'Genesis Device: sacrifique quantos terrenos quiser', terras.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, terras.length) : [];
        const n = ids.length ? (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length : 0;
        if (n) yield* buscaTerrenos(c, n, () => true, true, `Procure até ${n} carta(s) de terreno`);
      }, { timing: 'sorcery', text: '{3}{G}{G}, {T}, Sacrifique Genesis Device: Sacrifique quantos terrenos quiser e depois procure essa quantidade de cartas de terreno e coloque-as no campo viradas. Ative só como feitiço.' }),
    ],
  }],
  rulings: {},
});
