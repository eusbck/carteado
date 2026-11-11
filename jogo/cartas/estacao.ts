// Espaçonaves: estação (CR 702.184) e os símbolos de estação {N+} (CR 721.2).
import { activated, addCounters, isCreature, lkiObj, power, staticAbility } from '../motor/api.ts';
import type { ActivatedDef, SCtx, StaticDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { Mod, ObjId } from '../motor/types.ts';

export const cargas = (g: G, id: ObjId) => g.state.objects[id]?.counters.charge ?? 0;

/** "Estação" (CR 702.184a): vire outra criatura desvirada sua: marcadores de carga iguais à força dela; só como feitiço */
export function estacao(): ActivatedDef {
  return activated([{ k: 'tapCreatures', n: 1, label: 'outra criatura desvirada' }], function* (c) {
    const [virada] = ((c.data.costInfo as { tappedCreatures?: ObjId[] } | undefined)?.tappedCreatures ?? []);
    if (virada === undefined) return;
    // a força da criatura virada (a última conhecida, se ela saiu)
    const f = c.g.state.objects[virada]?.zone === 'battlefield' && isCreature(c.g, virada) ? power(c.g, virada) : (lkiObj(c.g, virada) ? Math.max(0, power(c.g, virada)) : 0);
    if (f > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', f, c.you);
  }, { kw: 'station', timing: 'sorcery', text: 'Estação (vire outra criatura que você controla: coloque nesta Espaçonave marcadores de carga iguais à força dela. Só como feitiço.)' });
}

/**
 * "{N+} [habilidades] [P/R]" (CR 721.2a-b): com N ou mais marcadores de carga, tem as habilidades e, com P/R, é criatura
 * além dos outros tipos. A condição fica em `affects` (o motor acha a camada pelos mods).
 */
export function nivelDeEstacao(n: number, opts: { criatura?: boolean; mods?: Mod[] }, text: string): StaticDef {
  // a caixa de P/R impressa já é a força e a resistência base (CR 721.2b); só falta virar criatura
  const mods: Mod[] = [
    ...(opts.criatura ? [{ k: 'addTypes', types: ['Creature'] } as Mod] : []),
    ...(opts.mods ?? []),
  ];
  return staticAbility({ affects: (c, o) => o.id === c.source && cargas(c.g, c.source) >= n, mods: () => mods, text });
}

/** condição de habilidade disparada ou ativada que vem depois de um {N+} */
export const comCargas = (n: number) => (c: SCtx) => cargas(c.g, c.source) >= n;
