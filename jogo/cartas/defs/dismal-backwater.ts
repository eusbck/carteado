// Dismal Backwater
// This land enters tapped.
// When this land enters, you gain 1 life.
// {T}: Add {U} or {B}.
import { defineCard, etb, gainLife, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Dismal Backwater',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando este terreno entra, você ganha 1 de vida.' }),
      mana(['U', 'B']),
    ],
  }],
  rulings: {},
});
