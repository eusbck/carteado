// Ancient Copper Dragon
// Flying
// Whenever this creature deals combat damage to a player, roll a d20. You create a number of Treasure tokens equal to
// the result.
import { createTokens, defineCard, keyword, on, rollDie, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ancient Copper Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 706.1a: d20, de 1 a 20
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = rollDie(c.g, c.you, 20);
        yield* createTokens(c.g, c.you, 'Treasure', n);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, role um d20. Você cria uma quantidade de fichas de Tesouro igual ao resultado.' }),
    ],
  }],
  rulings: {},
});
