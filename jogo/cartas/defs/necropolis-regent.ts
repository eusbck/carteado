// Necropolis Regent
// Flying
// Whenever a creature you control deals combat damage to a player, put that many +1/+1 counters on it.
import { addCounters, controllerOf, defineCard, isCreature, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Necropolis Regent',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source]
        && isCreature(c.g, e.source) && controllerOf(c.g, e.source) === c.you ? { criatura: e.source, n: e.amount } : false)), function* (c) {
        // ruling 1: se a criatura já morreu, nada acontece
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', c.event.n as number, c.you);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, coloque essa quantidade de marcadores +1/+1 nela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — a criatura que morreu antes de o gatilho resolver não recebe os marcadores (cartas/defs/necropolis-regent.ts)',
  },
});
