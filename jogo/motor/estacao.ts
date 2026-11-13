// lote3-b: Estação / station (CR 702.184) e as cartas de estação (CR 721). Usados pelas Spacecraft dos decks de
// Star Trek (We Are The Borg, Landing Party).
//
// - `station()` vai em abilities: "Vire outra criatura desvirada que você controla: ponha nesta permanente marcadores de
//   carga iguais à força da criatura virada. Só como feitiço" (702.184a). A força é lida quando a habilidade resolve
//   (a última conhecida, se a criatura saiu do campo).
// - `stationLevel(n, { creature, keywords, abilities, statics })`: o símbolo {N+} (721.2a-b). Com N ou mais marcadores
//   de carga, a permanente tem as habilidades e, com `creature`, é uma criatura além dos outros tipos, com a força e a
//   resistência do quadro (as impressas na carta; 721.2b). Fora do campo a carta não tem força nem resistência (721.2c):
//   como no Veículo, isso só importa se ela for criatura, e fora do campo ela não é.

import { addCounters } from './actions.ts';
import { isCreature, nameOf, power } from './chars.ts';
import type { AbilityDef, ActivatedDef, SCtx, StaticDef } from './defs.ts';
import { activated, lkiChars, staticAbility } from './dsl.ts';
import type { Mod, ObjId } from './types.ts';
import { obj, reg } from './registro.ts';

/** marcadores de carga na permanente */
export function chargeCounters(c: { g: SCtx['g'] }, id: ObjId): number {
  return c.g.state.objects[id]?.counters.charge ?? 0;
}

/** Estação (CR 702.184a) */
export function station(): ActivatedDef {
  return activated([{ k: 'tapPermanents', n: 1, label: 'outra criatura desvirada', filter: (c, id) => id !== c.source && isCreature(c.g, id) }], function* (c) {
    const virada = ((c.data.costInfo as { tapped?: ObjId[] } | undefined)?.tapped ?? [])[0];
    if (virada === undefined) return;
    // a força da criatura virada quando a habilidade resolve; se saiu do campo, a última conhecida
    const n = c.g.state.objects[virada]?.zone === 'battlefield' ? power(c.g, virada) : (lkiChars(c.g, virada)?.power ?? 0);
    if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') {
      addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', n, c.you);
      reg(c.g, 'outro', { rule: '702.184a', actor: c.you })`${obj(c.source)} recebe ${n} marcador(es) de carga (estação).`;
    }
  }, { kw: 'station', timing: 'sorcery', text: 'Estação (vire outra criatura que você controla: coloque marcadores de carga iguais à força dela nesta permanente. Estação só como feitiço.)' });
}

/**
 * Símbolo de estação {N+} (CR 721.2a-b). `keywords` e `abilities` (ids de habilidades definidas com defineAbility) são
 * as habilidades da faixa; `statics` são estáticas da faixa que afetam outros objetos (elas recebem a condição aqui).
 */
export function stationLevel(n: number, opts: { creature?: boolean; keywords?: string[]; abilities?: string[]; statics?: StaticDef[]; text: string }): AbilityDef[] {
  const tem = (c: SCtx) => chargeCounters(c, c.source) >= n;
  const out: AbilityDef[] = [];
  const mods: Mod[] = [
    ...(opts.creature ? [{ k: 'addTypes', types: ['Creature'] } as Mod] : []),
    ...(opts.keywords ?? []).map((kw) => ({ k: 'addKeyword', kw }) as Mod),
    ...(opts.abilities ?? []).map((id) => ({ k: 'addAbility', id }) as Mod),
  ];
  if (mods.length) {
    out.push(staticAbility({ kw: `station:${n}`, condition: tem, affects: (c, o) => o.id === c.source, mods: () => mods, text: `${n}+ | ${opts.text}` }));
  }
  for (const st of opts.statics ?? []) {
    const cond = st.condition;
    out.push({ ...st, condition: (c: SCtx) => tem(c) && (!cond || cond(c)) });
  }
  return out;
}
