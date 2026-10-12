// Captain America, Team Leader
// Whenever another Hero you control enters, it gains vigilance and haste until end of turn. Put a +1/+1 counter on that
// Hero and a +1/+1 counter on Captain America.
import { addCounters, controllerOf, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'Captain America, Team Leader',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj !== c.source && !!c.g.state.objects[e.obj] && ehHeroi(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { heroi: e.obj } : false)), function* (c) {
        const id = c.event.heroi as number;
        if (c.g.state.objects[id]?.zone === 'battlefield') {
          untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'haste' }]);
          addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        }
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outro Hero que você controla entra, ele ganha vigilância e ímpeto até o fim do turno. Coloque um marcador +1/+1 nesse Hero e um marcador +1/+1 em Captain America.' }),
    ],
  }],
  rulings: {},
});