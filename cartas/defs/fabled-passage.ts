// Fabled Passage
// {T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped,
// then shuffle. Then if you control four or more lands, untap that land.
import { activated, controlledBy, defineCard, fetchBasicToBattlefield, isLand, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Fabled Passage',
  faces: [{
    abilities: [
      activated('{T}, Sacrifice this land', function* (c) {
        const [land] = yield* fetchBasicToBattlefield(c, 1, { prompt: 'Procure uma carta de terreno básico' });
        // ruling 2: entra virado e depois é desvirado
        if (land !== undefined && controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 4) untap(c.g, land);
      }, { text: '{T}, Sacrifique este terreno: Procure um terreno básico e coloque-o no campo virado; depois embaralhe. Então, se você controla quatro ou mais terrenos, desvire-o.' }),
    ],
  }],
  rulings: {
    1: 'teste: com quatro terrenos contando o novo (e não o Passage), o terreno é desvirado',
    2: 'teste: com quatro terrenos contando o novo (e não o Passage), o terreno é desvirado',
  },
});
