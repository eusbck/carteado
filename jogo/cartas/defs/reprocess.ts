// Reprocess — Sacrifice any number of artifacts, creatures, and/or lands. Draw a card for each permanent sacrificed this way.
import { chooseItems, controlledBy, defineCard, draw, isCreature, isLand, isType, nameOf, objItem, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Reprocess',
  faces: [{
    spell: {
      *effect(c) {
        const cands = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact') || isCreature(c.g, id) || isLand(c.g, id));
        if (!cands.length) return;
        const ids = yield* chooseItems(c.g, c.you, 'Reprocess: sacrifique artefatos, criaturas e/ou terrenos (compra uma carta por cada)', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, cands.length);
        const n = ids.length ? (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length : 0;
        if (n) yield* draw(c.g, c.you, n);
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 701.21a — conta os permanentes de fato sacrificados' },
});
