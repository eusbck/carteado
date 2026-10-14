// Jungle Hollow
// This land enters tapped.
// When this land enters, you gain 1 life.
// {T}: Add {B} or {G}.
import { defineCard, etb, gainLife, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Jungle Hollow',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando este terreno entra, você ganha 1 de vida.' }),
      mana(['B', 'G']),
    ],
  }],
  rulings: {},
});
