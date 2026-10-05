// Hateful Eidolon
// Lifelink
// Whenever an enchanted creature dies, draw a card for each Aura you controlled that was attached to it.
import { controllerOf, defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';

export default defineCard({
  name: 'Hateful Eidolon',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // rulings 1-2: olha para trás — conta as Auras que saíram junto com a criatura
      triggered(on.batch((evs, c) => {
        const s = c.g.state;
        const saiu = (e: GameEvent): e is Extract<GameEvent, { type: 'zone' }> => e.type === 'zone' && e.from === 'battlefield';
        const out: Record<string, unknown>[] = [];
        for (const e of evs) {
          if (!saiu(e) || e.to !== 'graveyard' || !s.lki[e.old]?.chars.types.includes('Creature')) continue;
          const auras: { aura: boolean; minha: boolean }[] = [];
          for (const id of s.zones.battlefield) {
            const o = s.objects[id];
            if (o.attachedTo === e.old && !o.phasedOut) auras.push({ aura: true, minha: controllerOf(c.g, id) === c.you });
          }
          for (const x of evs) {
            if (!saiu(x)) continue;
            const l = s.lki[x.old];
            if (l?.obj.attachedTo === e.old && l.chars.subtypes.includes('Aura')) auras.push({ aura: true, minha: l.chars.controller === c.you });
          }
          if (auras.length) out.push({ n: auras.filter((a) => a.minha).length });
        }
        return out;
      }), function* (c) {
        const n = c.event.n as number;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que uma criatura encantada morre, compre uma carta para cada Aura que você controlava anexada a ela.' }),
    ],
  }],
  rulings: {
    1: 'teste: morrendo junto com a criatura encantada, ainda dispara',
    2: 'teste: Aura destruída junto com a criatura conta',
  },
});
