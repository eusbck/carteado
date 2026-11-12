// Last March of the Ents
// This spell can't be countered.
// Draw cards equal to the greatest toughness among creatures you control, then put any number of creature cards from
// your hand onto the battlefield.
import { chooseItems, defineCard, draw, isCreature, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import { maiorResistencia } from '../voja.ts';

export default defineCard({
  name: 'Last March of the Ents',
  faces: [{
    cantBeCountered: true,
    spell: {
      *effect(c) {
        const g = c.g;
        const n = maiorResistencia(g, c.you);
        if (n > 0) yield* draw(g, c.you, n);
        const cands = g.state.zones.hand[c.you].filter((id) => isCreature(g, id));
        if (!cands.length) return;
        const esc = yield* chooseItems(g, c.you, 'Last March of the Ents: coloque no campo quantas cartas de criatura da sua mão quiser', cands.map((id) => ({ ...objItem(g, id, nameOf(g, id)), card: { def: g.state.objects[id].def } })), 0, cands.length);
        if (esc.length) yield* putOntoBattlefield(g, esc.map((id) => ({ id: Number(id), controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {},
});
