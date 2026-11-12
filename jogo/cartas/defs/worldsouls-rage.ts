// Worldsoul's Rage
// Worldsoul's Rage deals X damage to any target. Put up to X land cards from your hand and/or graveyard onto the
// battlefield tapped.
import { chooseItems, dealDamage, defineCard, isLand, nameOf, objItem, putOntoBattlefield, t, tgtRef } from '../../motor/api.ts';

export default defineCard({
  name: "Worldsoul's Rage",
  faces: [{
    spell: {
      targets: [t.any()],
      *effect(c) {
        const alvo = tgtRef(c);
        if (alvo && c.x > 0) dealDamage(c.g, [{ source: c.source, target: alvo, amount: c.x, combat: false }]);
        if (c.x <= 0) return;
        const s = c.g.state;
        const cands = [...s.zones.hand[c.you], ...s.zones.graveyard[c.you]].filter((id) => isLand(c.g, id));
        if (!cands.length) return;
        const rot = (id: number) => `${nameOf(c.g, id)} (${s.objects[id].zone === 'hand' ? 'mão' : 'cemitério'})`;
        const esc = yield* chooseItems(c.g, c.you, `Worldsoul's Rage: coloque até ${c.x} carta(s) de terreno da mão e/ou do cemitério no campo viradas`, cands.map((id) => objItem(c.g, id, rot(id))), 0, Math.min(c.x, cands.length));
        if (esc.length) yield* putOntoBattlefield(c.g, esc.map((id) => ({ id: Number(id), controller: c.you, tapped: true })), 'effect');
      },
    },
  }],
  rulings: {},
});
