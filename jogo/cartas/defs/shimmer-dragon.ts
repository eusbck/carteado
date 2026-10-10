// Shimmer Dragon
// Flying
// As long as you control four or more artifacts, this creature has hexproof. (It can't be the target of spells or abilities your opponents control.)
// Tap two untapped artifacts you control: Draw a card.
import { activated, defineCard, draw, keyword, selfGets } from '../../motor/api.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Shimmer Dragon",
  faces: [{
    abilities: [keyword('flying'),
    selfGets(() => [{ k: 'addKeyword', kw: 'hexproof' }], 'Tem resistência a magia enquanto você controla quatro ou mais artefatos.', { condition: (c) => artifacts(c).length >= 4 }),
    activated('Tap two untapped artifacts you control', function*(c) { yield* draw(c.g, c.you, 1); }, { text: 'Vire dois artefatos desvirados que você controla: compre uma carta.' }),
    ]
  }],
  rulings: {},
});
