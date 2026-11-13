// Ingenious Prodigy
// Skulk (This creature can't be blocked by creatures with greater power.)
// This creature enters with X +1/+1 counters on it.
// At the beginning of your upkeep, if this creature has one or more +1/+1 counters on it, you may remove a +1/+1 counter
// from it. If you do, draw a card.
import { defineCard, draw, entersWithCounters, keyword, on, removeCounters, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const temMarcador = (c: SCtx): boolean => (c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0) > 0;

export default defineCard({
  name: 'Ingenious Prodigy',
  faces: [{
    abilities: [
      keyword('skulk'),
      entersWithCounters('+1/+1', (_c, ev) => ev.spell?.x ?? 0),
      triggered(on.upkeep('you'), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Ingenious Prodigy: remover um marcador +1/+1 para comprar uma carta?'))) return;
        if (removeCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1) > 0) yield* draw(c.g, c.you, 1);
      }, {
        // CR 603.4: condição interveniente
        condition: temMarcador,
        text: 'No início da sua manutenção, se esta criatura tiver um ou mais marcadores +1/+1, você pode remover um marcador +1/+1 dela. Se fizer isso, compre uma carta.',
      }),
    ],
  }],
  rulings: {},
});
