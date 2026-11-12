// Scapeshift
// Sacrifice any number of lands. Search your library for up to that many land cards, put them onto the battlefield
// tapped, then shuffle.
import { defineCard } from '../../motor/api.ts';
import { buscaTerrenosParaOCampo, sacrificaTerrenos } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Scapeshift',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: sacrificar faz parte da resolução, não é custo
        const n = yield* sacrificaTerrenos(c, 'Scapeshift: sacrifique quantos terrenos quiser');
        yield* buscaTerrenosParaOCampo(c, n, `Scapeshift: procure até ${n} carta(s) de terreno`, { tapped: true });
      },
    },
  }],
  rulings: {
    1: 'teste: sacrifica na resolução os terrenos escolhidos e busca outros tantos, que entram virados',
  },
});
