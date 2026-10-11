// Radiant Fountain
// When this land enters, you gain 2 life.
// {T}: Add {C}.
import { defineCard, etb, gainLife, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Radiant Fountain',
  faces: [{
    abilities: [
      etb(function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: 'Quando este terreno entra, você ganha 2 de vida.' }),
      mana('C'),
    ],
  }],
  rulings: {},
});
