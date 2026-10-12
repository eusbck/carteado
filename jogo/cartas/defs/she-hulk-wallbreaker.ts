// She-Hulk, Wallbreaker
// Trample
// Other Heroes you control have trample.
// Whenever a Hero you control becomes blocked, put a +1/+1 counter on that Hero for each creature blocking it.
import { addCounters, and, anthem, controllerOf, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'She-Hulk, Wallbreaker',
  faces: [{
    abilities: [
      keyword('trample'),
      anthem(and(is.yours, is.other, (c, id) => ehHeroi(c.g, id)), () => [{ k: 'addKeyword', kw: 'trample' }], 'Os outros Heroes que você controla têm atropelar.'),
      // um gatilho para cada Hero seu que ficou bloqueado, com o número de bloqueadoras
      triggered(on.custom((e, c) => {
        if (e.type !== 'blockers') return false;
        const porAtacante = new Map<number, number>();
        for (const [, atacante] of e.blocks) porAtacante.set(atacante, (porAtacante.get(atacante) ?? 0) + 1);
        return [...porAtacante].filter(([id]) => !!c.g.state.objects[id] && ehHeroi(c.g, id) && controllerOf(c.g, id) === c.you).map(([heroi, n]) => ({ heroi, n }));
      }), function* (c) {
        const id = c.event.heroi as number;
        if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', Number(c.event.n), c.you);
      }, { text: 'Sempre que um Hero que você controla fica bloqueado, coloque um marcador +1/+1 nesse Hero para cada criatura que o bloqueia.' }),
    ],
  }],
  rulings: {},
});