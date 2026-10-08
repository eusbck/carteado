// High Market
// {T}: Add {C}.
// {T}, Sacrifice a creature: You gain 1 life.
import { activated, defineCard, gainLife, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'High Market',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice a creature', function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: '{T}, Sacrifique uma criatura: Você ganha 1 de vida.' }),
    ],
  }],
  rulings: {},
});
