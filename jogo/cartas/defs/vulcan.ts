// Vulcan
// This land enters tapped.
// When this land enters, you gain 1 life.
// {T}: Add {W} or {U}.
import { defineCard, etb, gainLife, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Vulcan',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando este terreno entra, você ganha 1 de vida.' }),
      mana(['W', 'U']),
    ],
  }],
  rulings: {},
});
