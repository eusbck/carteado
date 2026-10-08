// Mind Stone
// {T}: Add {C}.
// {1}, {T}, Sacrifice this artifact: Draw a card.
import { activated, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Mind Stone',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{1}, {T}, Sacrifice this artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Sacrifique este artefato: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
