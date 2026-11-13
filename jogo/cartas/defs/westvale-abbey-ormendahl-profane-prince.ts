// Westvale Abbey // Ormendahl, Profane Prince
// Frente — {T}: Add {C}.
// {5}, {T}, Pay 1 life: Create a 1/1 white and black Human Cleric creature token.
// {5}, {T}, Sacrifice five creatures: Transform this land, then untap it.
// //
// Verso — Flying, lifelink, indestructible, haste
import { activated, createTokens, defineCard, is, keywords, mana, transformFrom, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Westvale Abbey // Ormendahl, Profane Prince',
  faces: [
    {
      abilities: [
        mana('C'),
        activated('{5}, {T}, Pay 1 life', function* (c) {
          yield* createTokens(c.g, c.you, 'Human Cleric', 1);
        }, { text: '{5}, {T}, Pague 1 de vida: Crie uma ficha de criatura Human Cleric branca e preta 1/1.' }),
        activated([{ k: 'mana', cost: '{5}' }, { k: 'tap' }, { k: 'sacrifice', n: 5, filter: is.creature, label: 'cinco criaturas' }], function* (c) {
          // CR 701.27f: só transforma se ainda estiver com a frente para cima; depois desvira
          if (transformFrom(c.g, c.source, 0)) untap(c.g, c.source);
        }, { text: '{5}, {T}, Sacrifique cinco criaturas: Transforme este terreno, depois desvire-o.' }),
      ],
    },
    {
      abilities: [...keywords('flying', 'lifelink', 'indestructible', 'haste')],
    },
  ],
  rulings: {
    1: 'teste: sacrificando cinco criaturas, vira Ormendahl desvirado',
  },
});
