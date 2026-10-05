// Containment Construct
// Whenever you discard a card, you may exile that card from your graveyard. If you do, you may play that card this turn.
import { allowPlay, defineCard, exile, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Containment Construct',
  faces: [{
    abilities: [triggered(on.custom((e, c) => (e.type === 'discard' && e.player === c.you ? { carta: e.obj } : false)), function* (c) {
      const id = c.event.carta as ObjId;
      if (c.g.state.objects[id]?.zone !== 'graveyard') return;
      if (!(yield* yesNo(c.g, c.you, `Containment Construct: exilar ${nameOf(c.g, id)} para poder jogá-la neste turno?`))) return;
      const [ex] = yield* exile(c.g, [id]);
      if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
    }, { text: 'Sempre que você descarta uma carta, você pode exilá-la do seu cemitério. Se fizer isso, você pode jogá-la neste turno.' })],
  }],
  rulings: {},
});
