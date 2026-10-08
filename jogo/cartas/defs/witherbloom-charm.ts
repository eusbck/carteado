// Witherbloom Charm
// Choose one —
// • You may sacrifice a permanent. If you do, draw two cards.
// • You gain 5 life.
// • Destroy target nonland permanent with mana value 2 or less.
import { chooseItems, controlledBy, defineCard, destroy, draw, gainLife, is, modal, nameOf, objItem, sacrifice, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Witherbloom Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Você pode sacrificar um permanente. Se fizer isso, compre duas cartas',
          *effect(c) {
            const meus = controlledBy(c.g, c.you, () => true);
            if (meus.length === 0) return;
            const pick = yield* chooseItems(c.g, c.you, 'Witherbloom Charm: você pode sacrificar um permanente para comprar duas cartas', meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
            if (pick.length === 0) return;
            const [r] = yield* sacrifice(c.g, [Number(pick[0])]);
            if (r !== null) yield* draw(c.g, c.you, 2);
          },
        },
        { text: 'Você ganha 5 de vida', *effect(c) { gainLife(c.g, c.you, 5, c.source); } },
        {
          text: 'Destrua o permanente não terreno alvo com valor de mana 2 ou menos',
          targets: [t.nonlandPermanent(is.mvAtMost(2), 'permanente não terreno alvo com valor de mana 2 ou menos')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: { 1: 'regra geral: CR 107.3g — X vale 0 no campo (manaValue)' },
});
