// Auntie Ool, Cursewretch
// Ward—Blight 2. (To blight 2, a player puts two -1/-1 counters on a creature they control.)
// Whenever one or more -1/-1 counters are put on a creature, draw a card if you control that creature. If you don't
// control it, its controller loses 1 life.
import { controllerOf, defineCard, draw, isCreature, loseLife, on, triggered, ward } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Auntie Ool, Cursewretch',
  faces: [{
    abilities: [
      ...ward('blight:2'),
      triggered(on.custom((e, c) => e.type === 'counters' && e.kind === '-1/-1' && e.amount > 0 && e.target.kind === 'obj' && !!c.g.state.objects[e.target.id] && isCreature(c.g, e.target.id) ? { criatura: e.target.id } : false), function* (c) {
        const id = c.event.criatura as ObjId;
        const o = c.g.state.objects[id] ?? c.g.state.lki[id]?.obj;
        if (!o) return;
        const dono = c.g.state.objects[id] ? controllerOf(c.g, id) : o.controller;
        if (dono === c.you) yield* draw(c.g, c.you, 1);
        else loseLife(c.g, dono, 1, c.source);
      }, { text: 'Sempre que um ou mais marcadores -1/-1 são colocados numa criatura, compre uma carta se você a controla. Se não, o controlador dela perde 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.68a — blight põe todos os marcadores numa só criatura',
    2: 'regra geral: CR 601.2h — custos pagos sem respostas no meio',
    3: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam nas ações de estado',
    4: 'regra geral: CR 701.68 — pode escolher criatura que vai morrer',
    5: 'regra geral: CR 603.10a — a última informação conhecida vê todos os marcadores',
    6: 'teste: sem criatura, não dá para fazer blight e a mágica é anulada',
  },
});
