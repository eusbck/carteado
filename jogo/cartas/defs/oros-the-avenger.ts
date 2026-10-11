// Oros, the Avenger
// Flying
// Whenever Oros deals combat damage to a player, you may pay {2}{W}. If you do, Oros deals 3 damage to each nonwhite
// creature.
import { allCreatures, chars, dealDamage, defineCard, keyword, mayPay, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Oros, the Avenger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (!(yield* mayPay(c, c.you, '{2}{W}', 'Oros causar 3 de dano a cada criatura que não é branca'))) return;
        const ids = allCreatures(c.g).filter((id) => !chars(c.g, id).colors.includes('W'));
        dealDamage(c.g, ids.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 3, combat: false })));
      }, { text: 'Sempre que Oros causa dano de combate a um jogador, você pode pagar {2}{W}. Se pagar, Oros causa 3 de dano a cada criatura que não é branca.' }),
    ],
  }],
  rulings: {},
});