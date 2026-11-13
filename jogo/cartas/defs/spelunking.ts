// Spelunking
// When this enchantment enters, draw a card, then you may put a land card from your hand onto the battlefield. If you put
// a Cave onto the battlefield this way, you gain 4 life.
// Lands you control enter untapped.
import { chooseItems, defineCard, draw, etb, gainLife, isLand, lkiChars, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import { terrenosEntramDesvirados } from '../terras.ts';

export default defineCard({
  name: 'Spelunking',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* draw(c.g, c.you, 1);
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Spelunking: você pode colocar uma carta de terreno da sua mão no campo', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        const [novo] = yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
        if (novo !== undefined && novo !== null && lkiChars(c.g, novo)?.subtypes.includes('Cave')) gainLife(c.g, c.you, 4, c.source);
      }, { text: 'Quando este encantamento entra, compre uma carta; depois você pode colocar uma carta de terreno da sua mão no campo. Se colocar uma Caverna assim, você ganha 4 pontos de vida.' }),
      // ruling 1: aplicada por último, o terreno entra desvirado
      terrenosEntramDesvirados(),
    ],
  }],
  rulings: {
    1: 'teste: o terreno que entraria virado entra desvirado',
    2: 'teste: o terreno posto pelo gatilho dela entra desvirado; o que entra junto com ela, não',
  },
});
