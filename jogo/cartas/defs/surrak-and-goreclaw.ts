// Surrak and Goreclaw
// Trample
// Other creatures you control have trample.
// Whenever another nontoken creature you control enters, put a +1/+1 counter on it. It gains haste until end of turn.
import { addCounters, and, anthem, controllerOf, defineCard, is, isCreature, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Surrak and Goreclaw',
  faces: [{
    abilities: [
      keyword('trample'),
      anthem(and(is.creature, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'trample' }], 'As outras criaturas que você controla têm atropelar.'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj !== c.source && !e.token && !!c.g.state.objects[e.obj]
        && isCreature(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { criatura: e.obj } : false)), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
      }, { text: 'Sempre que outra criatura que não é ficha que você controla entra, coloque um marcador +1/+1 nela. Ela ganha ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
