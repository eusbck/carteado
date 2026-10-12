// Falcon and Redwing
// Flying
// Whenever Falcon and Redwing deal combat damage to a player, create that many 1/1 white Bird creature tokens with
// flying, then put a +1/+1 counter on Falcon and Redwing.
import { addCounters, createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Falcon and Redwing',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = Number(c.event.amount ?? 0);
        if (n > 0) yield* createTokens(c.g, c.you, 'Bird', n);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que Falcon and Redwing causam dano de combate a um jogador, crie essa quantidade de fichas de criatura Bird 1/1 brancas com voar e depois coloque um marcador +1/+1 em Falcon and Redwing.' }),
    ],
  }],
  rulings: {},
});