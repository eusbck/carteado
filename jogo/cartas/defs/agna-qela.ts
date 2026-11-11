// Agna Qel'a
// This land enters tapped unless you control a basic land.
// {T}: Add {U}.
// {2}{U}, {T}: Draw a card, then discard a card.
import { activated, defineCard, land, loot, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Agna Qel'a",
  faces: [{
    abilities: [
      // ruling 1: os terrenos básicos que entram junto não contam (só os que já estão no campo)
      land.tappedUnlessBasics(1),
      mana('U'),
      activated('{2}{U}, {T}', function* (c) { yield* loot(c, c.you, 1, 1); }, { text: '{2}{U}, {T}: Compre uma carta e depois descarte uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: entra virado sem terreno básico no campo; desvirado com um' },
});
