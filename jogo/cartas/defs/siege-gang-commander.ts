// Siege-Gang Commander
// When this creature enters, create three 1/1 red Goblin creature tokens.
// {1}{R}, Sacrifice a Goblin: This creature deals 2 damage to any target.
import { activated, cost, createTokens, dealDamage, defineCard, etb, is, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Siege-Gang Commander',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Goblin', 3); }, { text: 'Quando esta criatura entra, crie três fichas de criatura Goblin 1/1 vermelhas.' }),
      // ruling 1: pode sacrificar qualquer Goblin seu, inclusive ele mesmo (a fonte do dano continua sendo ele, pela última informação)
      activated([...cost('{1}{R}'), { k: 'sacrifice', n: 1, filter: is.subtype('Goblin'), label: 'um Goblin' }], function* (c) {
        const r = c.targets[0]?.[0];
        if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 2, combat: false }]);
      }, { targets: [t.any()], text: '{1}{R}, Sacrifique um Goblin: Esta criatura causa 2 de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificando um Goblin, até ele mesmo, causa 2 de dano a qualquer alvo',
  },
});
