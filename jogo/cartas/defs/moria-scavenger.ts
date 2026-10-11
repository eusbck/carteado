// Moria Scavenger
// Deathtouch, haste
// {T}, Discard a card: Draw a card. If the discarded card was a creature card, amass Orcs 1. (Put a +1/+1 counter on an
// Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)
import { activated, amass, defineCard, draw, isCreature, keywords } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Moria Scavenger',
  faces: [{
    abilities: [
      ...keywords('deathtouch', 'haste'),
      activated('{T}, Discard a card', function* (c) {
        yield* draw(c.g, c.you, 1);
        // a carta descartada no custo fica guardada no pagamento (motor/costs.ts)
        const descartadas = ((c.data.costInfo as { discarded?: (ObjId | null)[] } | undefined)?.discarded ?? []).filter((x): x is ObjId => x !== null);
        if (descartadas.some((id) => !!c.g.state.objects[id] && isCreature(c.g, id))) yield* amass(c.g, c.you, 'Orc', 1);
      }, { text: '{T}, Descarte uma carta: Compre uma carta. Se a carta descartada era uma carta de criatura, reúna Orcs 1.' }),
    ],
  }],
  rulings: {
    1: REUNIR.escrita,
    2: REUNIR.como,
    3: REUNIR.zumbis,
    4: REUNIR.varios,
    5: REUNIR.entra00,
    6: REUNIR.alvos,
    7: REUNIR.reunido,
  },
});
