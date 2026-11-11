// Worldsoul's Rage
// Worldsoul's Rage deals X damage to any target. Put up to X land cards from your hand and/or graveyard onto the
// battlefield tapped.
import { chooseItems, dealDamage, defineCard, isLand, nameOf, objItem, putOntoBattlefield, t } from '../../motor/api.ts';

export default defineCard({
  name: "Worldsoul's Rage",
  faces: [{
    spell: {
      targets: [t.any()],
      *effect(c) {
        const x = c.x ?? 0;
        const alvo = c.targets[0]?.[0];
        if (alvo && x > 0) dealDamage(c.g, [{ source: c.source, target: alvo, amount: x, combat: false }]);
        const s = c.g.state;
        const cands = [...s.zones.hand[c.you], ...s.zones.graveyard[c.you]].filter((id) => isLand(c.g, id));
        if (!cands.length || x <= 0) return;
        const k = Math.min(x, cands.length);
        const esc = yield* chooseItems(c.g, c.you, `Coloque até ${k} carta(s) de terreno da mão e/ou do cemitério no campo, viradas`, cands.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (${s.objects[id].zone === 'hand' ? 'mão' : 'cemitério'})`)), 0, k);
        if (esc.length) yield* putOntoBattlefield(c.g, esc.map((id) => ({ id: Number(id), controller: c.you, tapped: true })), 'effect');
      },
    },
  }],
  rulings: {},
});
