// Cryptic Caves
// {T}: Add {C}.
// {1}, {T}, Sacrifice this land: Draw a card. Activate only if you control five or more lands.
import { activated, controlledBy, defineCard, draw, isLand, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Cryptic Caves',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      // CR 602.1b: a restrição vale na ativação, antes de sacrificar este terreno como custo.
      activated('{1}, {T}, Sacrifice this land', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 5,
        text: '{1}, {T}, Sacrifique este terreno: Compre uma carta. Ative apenas se você controlar cinco ou mais terrenos.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conta a si mesmo entre os cinco terrenos e compra depois do sacrifício',
    2: 'teste: com duas Caves e outros três terrenos, só uma pode ser sacrificada',
  },
});
