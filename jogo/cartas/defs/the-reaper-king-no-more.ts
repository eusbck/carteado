// The Reaper, King No More
// When The Reaper enters, put a -1/-1 counter on each of up to two target creatures.
// Whenever a creature an opponent controls with a -1/-1 counter on it dies, you may put that card onto the battlefield
// under your control. Do this only once each turn.
import { addCounters, defineCard, etb, nameOf, on, putOntoBattlefield, t, triggered, upTo, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'The Reaper, King No More',
  faces: [{
    abilities: [
      etb(function* (c) {
        for (const r of c.targets[0] ?? []) if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: r.id }, '-1/-1', 1, c.you);
      }, { targets: [upTo(2, t.creature(undefined, 'até duas criaturas alvo'))], text: 'Quando The Reaper entra, coloque um marcador -1/-1 em cada uma de até duas criaturas alvo.' }),
      triggered(on.dies((c, l, o) => c.g.isOpponent(c.you, l.controller) && (o.counters['-1/-1'] ?? 0) > 0), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // "faça isso só uma vez por turno"
        if (eu && eu.data.reaperTurno === s.turn.number) return;
        const carta = s.lki[c.event.old as ObjId]?.newId ?? null;
        if (carta === null || s.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, `The Reaper: pôr ${nameOf(c.g, carta)} no campo sob seu controle?`))) return;
        if (eu) eu.data.reaperTurno = s.turn.number;
        yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, { text: 'Sempre que uma criatura com marcador -1/-1 que um oponente controla morre, você pode pôr essa carta no campo sob seu controle. Faça isso só uma vez por turno.' }),
    ],
  }],
});
