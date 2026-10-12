// Hawkeye, Avenging Archer
// Reach
// Whenever a creature an opponent controls dies, if Hawkeye dealt damage to it this turn, draw a card.
// {T}: Hawkeye deals 1 damage to any target.
import { activated, damagedThisTurnBy, dealDamage, defineCard, draw, keyword, on, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Hawkeye, Avenging Archer',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.dies((c, lki, velho) => c.g.isOpponent(c.you, lki.controller) && damagedThisTurnBy(c.g, c.source, velho.id)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, se Hawkeye causou dano a ela neste turno, compre uma carta.' }),
      activated('{T}', function* (c) {
        const r = c.targets[0]?.[0];
        if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 1, combat: false }]);
      }, { targets: [t.any()], text: '{T}: Hawkeye causa 1 de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {},
});