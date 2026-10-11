// N'Yami-Class Mother Ship
// Flying, vigilance, haste
// Whenever this Vehicle deals combat damage to a player, look at the top card of your library. If it's a permanent card,
// you may put it onto the battlefield. If you don't put it onto the battlefield, put it into your hand.
// Crew 3
import { crew, defineCard, isPermanentCard, keywords, moveObjects, nameOf, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "N'Yami-Class Mother Ship",
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance', 'haste'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        // só você olha a carta
        if (isPermanentCard(c.g, topo) && (yield* yesNo(c.g, c.you, `N'Yami-Class Mother Ship: colocar ${nameOf(c.g, topo)} no campo? (senão, vai para a sua mão)`))) {
          yield* putOntoBattlefield(c.g, [{ id: topo, controller: c.you }], 'effect');
        } else yield* moveObjects(c.g, [{ id: topo, to: 'hand' }], 'effect');
      }, { text: 'Sempre que este Vehicle causa dano de combate a um jogador, olhe a carta do topo do seu grimório. Se for uma carta de permanente, você pode colocá-la no campo. Se não a colocar no campo, coloque-a na sua mão.' }),
      crew(3),
    ],
  }],
  rulings: {},
});