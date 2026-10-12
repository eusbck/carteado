// Professor Hulk
// Trample
// Whenever Professor Hulk deals combat damage to a player, draw that many cards.
import { defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Professor Hulk',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = Number(c.event.amount ?? 0);
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que Professor Hulk causa dano de combate a um jogador, compre essa quantidade de cartas.' }),
    ],
  }],
  rulings: {},
});