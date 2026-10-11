// Relic of Sauron
// {T}: Add two mana in any combination of {U}, {B}, and/or {R}.
// {3}, {T}: Draw two cards, then discard a card.
import { activated, defineCard, discard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Relic of Sauron',
  faces: [{
    abilities: [
      mana(['UU', 'UB', 'UR', 'BB', 'BR', 'RR'], { text: '{T}: Adicione duas manas em qualquer combinação de {U}, {B} e/ou {R}.' }),
      activated('{3}, {T}', function* (c) {
        yield* draw(c.g, c.you, 2);
        yield* discard(c.g, c.you, 1);
      }, { text: '{3}, {T}: Compre duas cartas e depois descarte uma carta.' }),
    ],
  }],
  rulings: {},
});
