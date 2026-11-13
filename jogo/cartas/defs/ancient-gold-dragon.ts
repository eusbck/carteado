// Ancient Gold Dragon
// Flying
// Whenever this creature deals combat damage to a player, roll a d20. You create a number of 1/1 blue Faerie Dragon
// creature tokens with flying equal to the result.
import { createTokens, defineCard, keyword, on, rollDie, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ancient Gold Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 706.1a: d20, de 1 a 20
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = rollDie(c.g, c.you, 20);
        yield* createTokens(c.g, c.you, 'Faerie Dragon', n);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, role um d20. Você cria uma quantidade de fichas de criatura Faerie Dragon azuis 1/1 com voar igual ao resultado.' }),
    ],
  }],
  rulings: {},
});
