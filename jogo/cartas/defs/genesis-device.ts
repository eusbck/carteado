// Genesis Device
// When Genesis Device enters, search your library for a basic land card or Planet card, put it onto the battlefield
// tapped, then shuffle.
// {3}{G}{G}, {T}, Sacrifice Genesis Device: Sacrifice any number of lands you control, then search your library for up
// to that many land cards, put them onto the battlefield tapped, then shuffle. Activate only as a sorcery.
import { activated, chars, defineCard, etb, isLand, putOntoBattlefield, searchLibrary, shuffleLibrary } from '../../motor/api.ts';
import { buscaTerrenosParaOCampo, ehBasico, sacrificaTerrenos } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Genesis Device',
  faces: [{
    abilities: [
      etb(function* (c) {
        const achados = yield* searchLibrary(c.g, c.you, c.you, {
          max: 1,
          filter: (id) => (isLand(c.g, id) && ehBasico(c.g, id)) || chars(c.g, id).subtypes.includes('Planet'),
          prompt: 'Genesis Device: procure uma carta de terreno básico ou uma carta de Planeta',
        });
        if (achados.length) yield* putOntoBattlefield(c.g, [{ id: achados[0], controller: c.you, tapped: true }], 'search');
        shuffleLibrary(c.g, c.you);
      }, { text: 'Quando Genesis Device entra, procure no seu grimório uma carta de terreno básico ou uma carta de Planeta, coloque-a no campo virada e embaralhe.' }),
      activated('{3}{G}{G}, {T}, Sacrifice this artifact', function* (c) {
        const n = yield* sacrificaTerrenos(c, 'Genesis Device: sacrifique quantos terrenos quiser');
        yield* buscaTerrenosParaOCampo(c, n, `Genesis Device: procure até ${n} carta(s) de terreno`, { tapped: true });
      }, {
        timing: 'sorcery',
        text: '{3}{G}{G}, {T}, Sacrifique Genesis Device: Sacrifique quantos terrenos quiser; depois procure no seu grimório até essa quantidade de cartas de terreno, coloque-as no campo viradas e embaralhe. Ative apenas como um feitiço.',
      }),
    ],
  }],
  rulings: {},
});
