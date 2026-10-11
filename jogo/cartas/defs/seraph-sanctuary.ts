// Seraph Sanctuary
// When this land enters, you gain 1 life.
// Whenever an Angel you control enters, you gain 1 life.
// {T}: Add {C}.
import { and, defineCard, etb, gainLife, is, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Seraph Sanctuary',
  faces: [{ abilities: [
    etb(function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando este terreno entra, você ganha 1 de vida.' }),
    triggered(on.enters(and(is.subtype('Angel'), is.yours)), function* (c) { gainLife(c.g, c.you, 1, c.source); },
      { text: 'Sempre que um Anjo que você controla entra, você ganha 1 de vida.' }),
    mana('C'),
  ] }],
  rulings: {},
});
