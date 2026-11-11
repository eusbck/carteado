// Sabotender
// Reach. Landfall — Whenever a land you control enters, this creature deals 1 damage to each opponent.
import { defineCard, dealDamage, on, triggered, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Sabotender',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.landfall(), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, esta criatura causa 1 de dano a cada oponente.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 120.3 — o dano é causado pela criatura (vínculo, toque mortífero etc. contam)' },
});
