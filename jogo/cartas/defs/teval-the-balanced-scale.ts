// Teval, the Balanced Scale
// Flying
// Whenever Teval attacks, mill three cards. Then you may return a land card from your graveyard to the battlefield tapped.
// Whenever one or more cards leave your graveyard, create a 2/2 black Zombie Druid creature token.
import { chooseItems, createTokens, defineCard, isLand, keyword, mill, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Teval, the Balanced Scale',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        yield* mill(c.g, c.you, 3);
        const terras = c.g.state.zones.graveyard[c.you].filter((id) => isLand(c.g, id));
        if (!terras.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Teval: devolva até uma carta de terreno do cemitério ao campo, virada', terras.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you, tapped: true }], 'effect');
      }, { text: 'Sempre que Teval ataca, moa três cartas. Depois você pode devolver uma carta de terreno do seu cemitério ao campo de batalha virada.' }),
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie Druid', 1);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, crie uma ficha de criatura Zombie Druid preta 2/2.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 603.2 — várias cartas saindo juntas disparam uma vez' },
});
