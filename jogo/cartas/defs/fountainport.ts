// Fountainport
// {T}: Add {C}.
// {2}, {T}, Sacrifice a token: Draw a card.
// {3}, {T}, Pay 1 life: Create a 1/1 blue Fish creature token.
// {4}, {T}: Create a Treasure token.
import { activated, createTokens, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Fountainport',
  faces: [{ abilities: [
    mana('C'),
    activated([
      { k: 'mana', cost: '{2}' }, { k: 'tap' },
      { k: 'sacrifice', n: 1, label: 'uma ficha', filter: (c, id) => c.g.state.objects[id].isToken },
    ], function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{2}, {T}, Sacrifique uma ficha: Compre uma carta.' }),
    activated('{3}, {T}, Pay 1 life', function* (c) { yield* createTokens(c.g, c.you, 'Fish', 1); },
      { text: '{3}, {T}, Pague 1 de vida: Crie uma ficha de criatura Fish azul 1/1.' }),
    activated('{4}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); },
      { text: '{4}, {T}: Crie uma ficha de Tesouro.' }),
  ] }],
  rulings: {},
});
