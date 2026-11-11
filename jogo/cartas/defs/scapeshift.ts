// Scapeshift
// Sacrifice any number of lands. Search your library for up to that many land cards, put them onto the battlefield
// tapped, then shuffle.
import { chooseItems, defineCard, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import { buscaTerrenos, terrenosDe } from '../terras.ts';

export default defineCard({
  name: 'Scapeshift',
  faces: [{
    spell: {
      *effect(c) {
        const meus = terrenosDe(c.g, c.you);
        const ids = meus.length ? yield* chooseItems(c.g, c.you, 'Scapeshift: sacrifique quantos terrenos quiser', meus.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, meus.length) : [];
        const n = ids.length ? (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length : 0;
        if (n > 0) yield* buscaTerrenos(c, n, () => true, true, `Procure até ${n} carta(s) de terreno`);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 701.21a — conta os terrenos de fato sacrificados' },
});
