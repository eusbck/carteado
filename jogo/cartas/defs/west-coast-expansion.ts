// West Coast Expansion
// Draw X cards. If X is 5 or more, you may cast a Hero spell from your hand without paying its mana cost.
import { chooseItems, defineCard, draw, isLand, mayCastFree, nameOf, objItem } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'West Coast Expansion',
  faces: [{
    spell: {
      *effect(c) {
        if (c.x > 0) yield* draw(c.g, c.you, c.x);
        if (c.x < 5) return;
        const herois = c.g.state.zones.hand[c.you].filter((id) => !isLand(c.g, id) && ehHeroi(c.g, id));
        if (!herois.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'West Coast Expansion: você pode conjurar uma mágica de Hero da mão sem pagar o custo de mana', herois.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]));
      },
    },
  }],
  rulings: {},
});