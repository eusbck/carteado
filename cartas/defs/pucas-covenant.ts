// Puca's Covenant
// Whenever a creature you control with a counter on it dies, you may return another target permanent card with mana
// value less than or equal to the number of counters on that creature from your graveyard to your hand. Do this only
// once each turn.
import { and, defineCard, is, manaValue, moveObjects, nameOf, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const total = (counters: Record<string, number>): number => Object.values(counters).reduce((a, n) => a + Math.max(0, n), 0);

export default defineCard({
  name: "Puca's Covenant",
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        if (!l || !l.chars.types.includes('Creature') || l.chars.controller !== c.you) return false;
        const n = total(l.obj.counters);
        return n > 0 ? { marcadores: n, carta: e.obj } : false;
      }), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // "faça isso só uma vez por turno"
        if (eu && eu.data.pucaTurno === s.turn.number) return;
        const id = tgt(c);
        if (id === null) return;
        if (!(yield* yesNo(c.g, c.you, `Puca's Covenant: devolver ${nameOf(c.g, id)} para a mão?`))) return;
        if (eu) eu.data.pucaTurno = s.turn.number;
        yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        // "outra" carta: não a criatura que morreu; ruling 1: X vale 0 no cemitério
        targets: [t.card('graveyard', and(is.permanentCard, (c, id) => id !== (c.event?.carta as ObjId | undefined) && manaValue(c.g, id) <= ((c.event?.marcadores as number | undefined) ?? 0)), 'outra carta de permanente alvo com valor de mana até o número de marcadores')],
        text: "Sempre que uma criatura com marcador que você controla morre, você pode devolver outra carta de permanente alvo com valor de mana menor ou igual ao número de marcadores dela do seu cemitério para a sua mão. Faça isso só uma vez por turno.",
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 202.3e — X vale 0 no cemitério' },
});
