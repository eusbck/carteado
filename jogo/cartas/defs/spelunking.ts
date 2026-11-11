// Spelunking
// When this enchantment enters, draw a card, then you may put a land card from your hand onto the battlefield. If you
// put a Cave onto the battlefield this way, you gain 4 life.
// Lands you control enter untapped.
import { chooseItems, defineCard, draw, etb, gainLife, isLand, isSubtype, nameOf, objItem, putOntoBattlefield, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Spelunking',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* draw(c.g, c.you, 1);
        const terras = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terras.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Spelunking: coloque até uma carta de terreno da mão no campo', terras.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, 1);
        if (!esc.length) return;
        const id = Number(esc[0]);
        const caverna = isSubtype(c.g, id, 'Cave');
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        if (caverna) gainLife(c.g, c.you, 4, c.source);
      }, { text: 'Quando este encantamento entra, compre uma carta e depois você pode colocar uma carta de terreno da sua mão no campo de batalha. Se colocar uma Cave assim, você ganha 4 de vida.' }),
      staticAbility({
        rules: { enterModifier: (c, ev, ch) => { if (ev.controller === c.you && ch.types.includes('Land')) ev.tapped = false; } },
        text: 'Os terrenos que você controla entram desvirados.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — vale também para terrenos que "entram virados" por efeito próprio',
    2: 'regra geral: CR 305.2 — pôr um terreno no campo não conta como jogar terreno',
  },
});
