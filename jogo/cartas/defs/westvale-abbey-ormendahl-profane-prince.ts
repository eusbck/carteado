// Westvale Abbey // Ormendahl, Profane Prince
// Frente — {T}: Add {C}. {5}, {T}, Pay 1 life: Create a 1/1 white and black Human Cleric creature token.
// {5}, {T}, Sacrifice five creatures: Transform this land, then untap it.
// Verso — Flying, lifelink, indestructible, haste
import { activated, createTokens, defineCard, isCreature, keyword, mana, transformFrom, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Westvale Abbey // Ormendahl, Profane Prince',
  faces: [
    {
      abilities: [
        mana('C'),
        activated('{5}, {T}, Pay 1 life', function* (c) { yield* createTokens(c.g, c.you, 'Human Cleric', 1); }, { text: '{5}, {T}, Pague 1 de vida: Crie uma ficha de criatura Human Cleric branca e preta 1/1.' }),
        activated([{ k: 'mana', cost: '{5}' }, { k: 'tap' }, { k: 'sacrifice', n: 5, filter: (c, id) => isCreature(c.g, id), label: 'cinco criaturas' }], function* (c) {
          if (c.g.state.objects[c.source]?.zone !== 'battlefield' || c.g.state.objects[c.source].face !== 0) return;
          if (transformFrom(c.g, c.source, 0)) untap(c.g, c.source);
        }, { text: '{5}, {T}, Sacrifique cinco criaturas: Transforme este terreno e depois desvire-o.' }),
      ],
    },
    { abilities: [keyword('flying'), keyword('lifelink'), keyword('indestructible'), keyword('haste')] },
  ],
  rulings: { 1: 'regra geral: CR 302.6 — com ímpeto, Ormendahl pode atacar no mesmo turno mesmo tendo transformado' },
});
