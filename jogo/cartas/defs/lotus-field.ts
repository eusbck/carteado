// Lotus Field
// Hexproof
// This land enters tapped.
// When this land enters, sacrifice two lands.
// {T}: Add three mana of any one color.
import { defineCard, etb, isLand, keyword, land, mana, sacrificeYours } from '../../motor/api.ts';

export default defineCard({
  name: 'Lotus Field',
  faces: [{
    abilities: [
      keyword('hexproof'),
      land.tapped(),
      etb(function* (c) { yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 2, 'dois terrenos'); }, { text: 'Quando entra, sacrifique dois terrenos.' }),
      mana(['WWW', 'UUU', 'BBB', 'RRR', 'GGG'], { text: '{T}: Adicione três manas de uma mesma cor.' }),
    ],
  }],
  rulings: { 1: 'teste: com menos de dois outros terrenos, sacrifica todos, inclusive ele' },
});
