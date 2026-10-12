// Quicksilver, Speedster
// Flash
// Double strike, haste
// As long as Quicksilver is tapped, you may cast spells as though they had flash.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Quicksilver, Speedster',
  faces: [{
    abilities: [
      ...keywords('flash', 'double strike', 'haste'),
      staticAbility({
        rules: { castAsThoughFlash: (c, jogador) => jogador === c.you && !!c.g.state.objects[c.source]?.tapped },
        text: 'Enquanto Quicksilver estiver virado, você pode conjurar mágicas como se tivessem lampejo.',
      }),
    ],
  }],
  rulings: {},
});