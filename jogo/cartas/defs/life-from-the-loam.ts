// Life from the Loam
// Return up to three target land cards from your graveyard to your hand.
// Dredge 3 (If you would draw a card, you may mill three cards instead. If you do, return this card from your
// graveyard to your hand.)
import { defineCard, is, mill, moveObjects, staticAbility, t, upTo, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Life from the Loam',
  faces: [{
    abilities: [
      // CR 702.52a: dragar é uma substituição da compra que funciona com a carta no cemitério
      staticAbility({
        zones: ['graveyard'],
        rules: {
          drawReplaceApplies: (c, p) => p === c.you && c.g.state.objects[c.source]?.zone === 'graveyard' && c.g.state.zones.library[p].length >= 3,
          drawReplace: function* (c, p) {
            if (!(yield* yesNo(c.g, p, 'Dragar 3 (Life from the Loam): moer três cartas e devolvê-la à mão em vez de comprar?', 'Dragar', 'Comprar'))) return false;
            yield* mill(c.g, p, 3);
            if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: c.source as ObjId, to: 'hand' }], 'effect');
            return true;
          },
        },
        kw: 'dredge',
        text: 'Dragar 3 (se você fosse comprar uma carta, você pode moer três cartas em vez disso. Se fizer isso, devolva esta carta do seu cemitério para a sua mão.)',
      }),
    ],
    spell: {
      targets: [upTo(3, t.card('graveyard', is.land, 'até três cartas de terreno alvo do seu cemitério'))],
      *effect(c) {
        const ids = (c.targets[0] ?? []).flatMap((x) => (x && x.kind === 'obj' && c.g.state.objects[x.id]?.zone === 'graveyard' ? [x.id] : []));
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.52b — com menos de três cartas no grimório, não dá para dragar',
    2: 'regra geral: CR 702.52a — dragar substitui cada compra, uma de cada vez',
    3: 'regra geral: CR 608.2b — os alvos ilegais ficam; os outros voltam',
    4: 'regra geral: CR 702.52a — moer não é comprar (não dispara "sempre que você compra")',
    5: 'regra geral: CR 702.52a — pode dragar na compra do começo do turno',
    6: 'regra geral: CR 115.1 — pode ter zero alvos',
  },
});
