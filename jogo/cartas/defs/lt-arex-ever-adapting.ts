// Lt. Arex, Ever-Adapting
// Trample
// Strange new worlds — Lt. Arex's power and toughness are each equal to the number of differently named lands you
// control.
// When Lt. Arex enters, draw three cards. You may put up to three land cards from your hand onto the battlefield
// tapped.
import { chooseItems, defineCard, draw, etb, isLand, keyword, nameOf, objItem, putOntoBattlefield, selfGets } from '../../motor/api.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';

export default defineCard({
  name: 'Lt. Arex, Ever-Adapting',
  faces: [{
    abilities: [
      keyword('trample'),
      // CR 604.3: define força e resistência em todas as zonas (camada 7a)
      selfGets((c) => { const n = terrenosComNomesDiferentes(c.g, c.you); return [{ k: 'setPT', p: n, t: n }]; },
        'Strange new worlds — A força e a resistência de Lt. Arex são iguais ao número de terrenos com nomes diferentes que você controla.', { cda: true }),
      etb(function* (c) {
        yield* draw(c.g, c.you, 3);
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Lt. Arex: você pode pôr até três cartas de terreno da sua mão no campo, viradas', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 3);
        if (esc.length) yield* putOntoBattlefield(c.g, esc.map((id) => ({ id: Number(id), controller: c.you, tapped: true })), 'effect');
      }, { text: 'Quando Lt. Arex entra, compre três cartas. Você pode pôr até três cartas de terreno da sua mão no campo, viradas.' }),
    ],
  }],
  rulings: {},
});
