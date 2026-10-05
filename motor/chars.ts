// Características calculadas pelo sistema de camadas (CR 613).
// Os permanentes são calculados juntos numa passada (as estáticas de uns afetam outros);
// objetos em outras zonas usam os valores copiáveis mais os efeitos que os afetam diretamente.

import { ability, cardDef, registry, type AbilityDef, type RuleHooks, type SCtx, type StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import { manaValueOf } from './mana.ts';
import { BASIC_LAND_MANA, faceManaValue, hasOracle, oracle, CREATURE_SUBTYPES } from './oracle.ts';
import type { AbilityInst, Chars, Color, CopyValues, GameObject, Layer, Mod, ObjId, PlayerId, ZoneName } from './types.ts';

export interface ActiveStatic {
  def: StaticDef;
  abilityId: string;
  source: ObjId;
  controller: PlayerId;
  timestamp: number;
  zone: ZoneName;
}

const LAYERS: Layer[] = ['2', '3', '4', '5', '6', '7a', '7b', '7c', '7d'];

export function modLayer(m: Mod, cda = false): Layer | null {
  switch (m.k) {
    case 'copy': return '1a';
    case 'control': return '2';
    case 'addTypes': case 'setTypes': case 'removeTypes': return '4';
    case 'setColors': return '5';
    case 'addKeyword': case 'addAbility': case 'loseAllAbilities': case 'loseKeyword': return '6';
    case 'setPT': return cda ? '7a' : '7b';
    case 'setT': return '7b';
    case 'pt': return '7c';
    case 'rule': return null;
  }
}

// ---------------------------------------------------------------------------
// Valores copiáveis (camada 1)
// ---------------------------------------------------------------------------
export function abilitiesOfDef(defName: string, face: number): AbilityInst[] {
  const token = registry.tokens.get(defName);
  const list: AbilityDef[] = token ? token.abilities : (cardDef(defName)?.faces[face]?.abilities ?? []);
  return list.map((a) => ({ id: a.id!, kw: a.kw, param: a.param }));
}

export function isTransform(defName: string): boolean {
  return hasOracle(defName) && oracle(defName).layout === 'transform';
}

/** características impressas de uma definição (carta ou ficha) e face */
export function printedChars(defName: string, face: number, owner: PlayerId): Chars {
  const token = registry.tokens.get(defName);
  if (token) {
    return {
      name: token.name, manaCost: null, manaValue: 0, colors: [...token.colors],
      supertypes: [...(token.supertypes ?? [])], types: [...token.types], subtypes: [...token.subtypes],
      abilities: abilitiesOfDef(defName, 0), power: token.power, toughness: token.toughness, loyalty: null, controller: owner,
    };
  }
  const card = oracle(defName);
  const f = card.faces[face] ?? card.faces[0];
  const abilities = abilitiesOfDef(defName, face);
  // CR 305.6: terrenos com tipo básico têm a habilidade de mana intrínseca
  if (f.types.includes('Land')) {
    for (const st of f.subtypes) {
      const c = BASIC_LAND_MANA[st];
      if (c) abilities.unshift({ id: `basic:${c}` });
    }
  }
  return {
    name: f.name,
    manaCost: f.manaCost,
    manaValue: faceManaValue(card, face),
    colors: [...f.colors],
    supertypes: [...f.supertypes], types: [...f.types], subtypes: [...f.subtypes],
    abilities,
    power: f.power, toughness: f.toughness, loyalty: f.loyalty,
    controller: owner,
  };
}

function applyExcept(c: Chars, v: CopyValues): Chars {
  const e = v.except;
  if (!e) return c;
  if (e.name !== undefined) c.name = e.name;
  if (e.setTypes) { c.types = [...e.setTypes]; }
  if (e.removeOtherTypes && e.addTypes) { c.types = [...e.addTypes]; }
  else if (e.addTypes) for (const t of e.addTypes) if (!c.types.includes(t)) c.types.push(t);
  if (e.removeOtherTypes) c.subtypes = c.subtypes.filter(() => false);
  if (e.addSubtypes) for (const t of e.addSubtypes) if (!c.subtypes.includes(t)) c.subtypes.push(t);
  if (e.addAbilities) for (const id of e.addAbilities) c.abilities.push({ id, kw: ability(id).kw, param: ability(id).param });
  if (e.addKeywords) for (const kw of e.addKeywords) c.abilities.push({ id: `kw:${kw}`, kw });
  if (e.power !== undefined) c.power = e.power;
  if (e.toughness !== undefined) c.toughness = e.toughness;
  if (e.colors) c.colors = [...e.colors];
  if (e.legendary === false) c.supertypes = c.supertypes.filter((s) => s !== 'Legendary');
  return c;
}

export function copyValuesChars(v: CopyValues, owner: PlayerId): Chars {
  return applyExcept(printedChars(v.def, v.face, owner), v);
}

/** face em uso: cartas que transformam só mostram o verso no campo e na pilha (CR 712.8a) */
/** permanente que entrou como Aura por bestow (CR 702.103) */
export function isBestowed(o: GameObject): boolean {
  return (o.data.spell as { method?: string } | undefined)?.method === 'bestow';
}


export function currentFace(o: GameObject): number {
  if (o.copyOf) return o.copyOf.face;
  if (isTransform(o.def) && (o.zone === 'battlefield' || o.zone === 'stack')) return o.face;
  return 0; // preparação: só as características normais em todas as zonas (CR 722.4)
}

/** CR 708.2a: permanente ou mágica virada para baixo é uma criatura 2/2 sem nome nem habilidades */
function faceDownChars(owner: PlayerId): Chars {
  return { name: '', manaCost: null, manaValue: 0, colors: [], supertypes: [], types: ['Creature'], subtypes: [], abilities: [], power: 2, toughness: 2, loyalty: null, controller: owner };
}

function layer1(g: G, o: GameObject): Chars {
  if (o.def === '') {
    // habilidade na pilha: só tem o texto da habilidade (CR 405.4)
    return { name: '', manaCost: null, manaValue: 0, colors: [], supertypes: [], types: [], subtypes: [], abilities: [], power: null, toughness: null, loyalty: null, controller: o.controller };
  }
  let c: Chars;
  if (o.faceDown && (o.zone === 'battlefield' || o.zone === 'stack')) c = faceDownChars(o.owner);
  else if (o.copyOf) c = copyValuesChars(o.copyOf, o.owner);
  else c = printedChars(o.def, currentFace(o), o.owner);
  // efeitos de cópia (camada 1a) em ordem de registro de data e hora
  if (!o.faceDown) {
    const copies = g.state.effects.filter((e) => e.affected?.includes(o.id) && e.mods.some((m) => m.k === 'copy'));
    copies.sort((a, b) => a.timestamp - b.timestamp);
    for (const e of copies) for (const m of e.mods) if (m.k === 'copy') c = copyValuesChars(m.of, o.owner);
  }
  c.controller = o.controller;
  // Bestow (CR 702.103b, 702.103e-f): como mágica conjurada por bestow, e como permanente enquanto
  // anexada, é uma Aura (encantamento) e não criatura; solta, volta a ser criatura
  const bestowAura = (o.zone === 'stack' && !!o.stack?.data.bestow) || (o.zone === 'battlefield' && isBestowed(o) && o.attachedTo !== null);
  if (bestowAura) {
    c.types = c.types.filter((t) => t !== 'Creature');
    c.subtypes = [...c.subtypes.filter((t) => !CREATURE_SUBTYPES.has(t)), 'Aura'];
    c.power = null;
    c.toughness = null;
  }
  if (o.zone === 'stack' && o.stack && c.manaCost) c.manaValue = manaValueOf(c.manaCost, o.stack.x);
  if (o.zone === 'battlefield' && c.types.includes('Planeswalker')) c.loyalty = o.counters.loyalty ?? 0;
  return c;
}

// ---------------------------------------------------------------------------
// Aplicação de modificações
// ---------------------------------------------------------------------------
function applyMod(c: Chars, m: Mod): void {
  switch (m.k) {
    case 'control': c.controller = m.player; break;
    case 'addTypes':
      for (const t of m.types ?? []) if (!c.types.includes(t)) c.types.push(t);
      for (const t of m.subtypes ?? []) if (!c.subtypes.includes(t)) c.subtypes.push(t);
      for (const t of m.supertypes ?? []) if (!c.supertypes.includes(t)) c.supertypes.push(t);
      break;
    case 'setTypes':
      c.types = [...m.types];
      c.subtypes = [...m.subtypes];
      if (!m.keepSupertypes) c.supertypes = c.supertypes.filter((s) => s === 'Legendary' || s === 'Basic');
      break;
    case 'removeTypes': c.types = c.types.filter((t) => !m.types.includes(t)); break;
    case 'setColors': c.colors = [...m.colors]; break;
    case 'addKeyword': c.abilities.push({ id: `kw:${m.kw}`, kw: m.kw, param: m.param }); break;
    case 'addAbility': { const a = ability(m.id); c.abilities.push({ id: m.id, kw: a.kw, param: a.param }); break; }
    case 'loseAllAbilities': c.abilities = []; break;
    case 'loseKeyword': c.abilities = c.abilities.filter((a) => a.kw !== m.kw); break;
    case 'setPT': c.power = m.p; c.toughness = m.t; break;
    case 'setT': c.toughness = m.t; break;
    case 'pt':
      if (c.power !== null) c.power += m.p;
      if (c.toughness !== null) c.toughness += m.t;
      break;
    default: break;
  }
}

function counterPT(counters: Record<string, number>): [number, number] {
  let p = 0, t = 0;
  for (const [k, n] of Object.entries(counters)) {
    const m = /^([+-]\d+)\/([+-]\d+)$/.exec(k);
    if (m && n > 0) { p += Number(m[1]) * n; t += Number(m[2]) * n; }
  }
  return [p, t];
}

// ---------------------------------------------------------------------------
// Estáticas ativas
// ---------------------------------------------------------------------------
/** ids de estáticas que funcionam fora do campo (CR 113.6) */
let offBattlefieldStatics: Set<string> | null = null;
function offBf(): Set<string> {
  if (!offBattlefieldStatics || offBattlefieldStatics.size === 0) {
    offBattlefieldStatics = new Set();
    for (const [id, a] of registry.abilities) if (a.kind === 'static' && a.zones && a.zones.some((z) => z !== 'battlefield')) offBattlefieldStatics.add(id);
  }
  return offBattlefieldStatics;
}
export function resetStaticIndex(): void { offBattlefieldStatics = null; }

function staticsFrom(g: G, id: ObjId, c: Chars, zone: ZoneName, out: ActiveStatic[]): void {
  const o = g.state.objects[id];
  for (const a of c.abilities) {
    if (a.id.startsWith('kw:') || a.id.startsWith('basic:')) continue;
    const def = registry.abilities.get(a.id);
    if (!def || def.kind !== 'static') continue;
    const zones = def.zones ?? ['battlefield'];
    if (!zones.includes(zone)) continue;
    out.push({ def, abilityId: a.id, source: id, controller: zone === 'battlefield' ? c.controller : o.owner, timestamp: o.timestamp, zone });
  }
}

// ---------------------------------------------------------------------------
// Passada completa
// ---------------------------------------------------------------------------
function computeAll(g: G): void {
  g.counters.charsComputations++;
  const s = g.state;
  const work = new Map<ObjId, Chars>();
  const bf = s.zones.battlefield;
  for (const id of bf) work.set(id, layer1(g, s.objects[id]));
  g.computing = work;
  try {
    // estáticas: do campo (exceto fora de fase, CR 702.26b) e de outras zonas quando a habilidade diz
    const statics: ActiveStatic[] = [];
    for (const id of bf) if (!s.objects[id].phasedOut) staticsFrom(g, id, work.get(id)!, 'battlefield', statics);
    const off = offBf();
    if (off.size > 0) {
      for (const zone of ['graveyard', 'hand', 'exile', 'command'] as ZoneName[]) {
        const ids = zone === 'graveyard' ? s.zones.graveyard.flat() : zone === 'hand' ? s.zones.hand.flat() : s.zones[zone as 'exile' | 'command'];
        for (const id of ids) {
          const c = layer1(g, s.objects[id]);
          if (c.abilities.some((a) => off.has(a.id))) staticsFrom(g, id, c, zone, statics);
        }
      }
    }
    interface Run { st: ActiveStatic; layers: Set<Layer>; first: Layer | null; affected: ObjId[] | null; dead: boolean; started: boolean }
    const runs: Run[] = statics.map((st) => {
      const layers = new Set<Layer>();
      if (st.def.mods) {
        const probeObj = s.objects[st.source];
        try {
          for (const m of st.def.mods({ g, you: st.controller, source: st.source }, probeObj)) {
            const L = modLayer(m, st.def.cda);
            if (L) layers.add(L);
          }
        } catch { /* a sondagem pode falhar para objetos sem as características esperadas */ }
      }
      const first = LAYERS.find((L) => layers.has(L)) ?? null;
      return { st, layers, first, affected: null, dead: false, started: false };
    });
    const effects = s.effects.filter((e) => e.affected && e.mods.some((m) => m.k !== 'copy' && m.k !== 'rule'));
    for (const L of LAYERS) {
      const entries: { ts: number; cda: boolean; objs: ObjId[]; mods: (o: ObjId) => Mod[] }[] = [];
      for (const r of runs) {
        if (r.dead || !r.layers.has(L)) continue;
        const ctx: SCtx = { g, you: r.st.controller, source: r.st.source };
        if (r.first === L && r.affected === null) {
          if (r.st.def.condition && !r.st.def.condition(ctx)) { r.dead = true; continue; }
          const aff = r.st.def.affects;
          r.affected = bf.filter((id) => !s.objects[id].phasedOut && (!aff || aff(ctx, s.objects[id])));
        }
        if (!r.affected) continue;
        r.started = true;
        const def = r.st.def;
        entries.push({ ts: r.st.timestamp, cda: !!def.cda, objs: r.affected, mods: (o) => def.mods!(ctx, s.objects[o]).filter((m) => modLayer(m, def.cda) === L) });
      }
      for (const e of effects) {
        const ms = e.mods.filter((m) => modLayer(m) === L);
        if (ms.length) entries.push({ ts: e.timestamp, cda: false, objs: e.affected!.filter((id) => work.has(id)), mods: () => ms });
      }
      entries.sort((a, b) => (a.cda === b.cda ? a.ts - b.ts : a.cda ? -1 : 1));
      for (const en of entries) for (const id of en.objs) {
        const c = work.get(id);
        if (!c) continue;
        for (const m of en.mods(id)) applyMod(c, m);
      }
      if (L === '7c') {
        for (const id of bf) {
          const c = work.get(id)!;
          if (c.power === null && c.toughness === null) continue;
          const [p, t] = counterPT(s.objects[id].counters);
          if (c.power !== null) c.power += p;
          if (c.toughness !== null) c.toughness += t;
        }
      }
      if (L === '6') {
        // estáticas cuja fonte perdeu a habilidade deixam de valer, salvo as que já começaram (CR 613.6)
        for (const r of runs) {
          if (r.dead || r.started || r.st.zone !== 'battlefield') continue;
          const c = work.get(r.st.source);
          if (!c || !c.abilities.some((a) => a.id === r.st.abilityId)) r.dead = true;
        }
        // estáticas concedidas na camada 6 passam a valer nas camadas seguintes
        const known = new Set(runs.map((r) => `${r.st.source}|${r.st.abilityId}`));
        for (const id of bf) {
          if (s.objects[id].phasedOut) continue;
          const extra: ActiveStatic[] = [];
          staticsFrom(g, id, work.get(id)!, 'battlefield', extra);
          for (const st of extra) {
            if (known.has(`${st.source}|${st.abilityId}`)) continue;
            const layers = new Set<Layer>();
            try { for (const m of st.def.mods?.({ g, you: st.controller, source: st.source }, s.objects[id]) ?? []) { const L2 = modLayer(m, st.def.cda); if (L2) layers.add(L2); } } catch { /* idem */ }
            const first = LAYERS.find((L2) => layers.has(L2) && LAYERS.indexOf(L2) > LAYERS.indexOf('6')) ?? null;
            runs.push({ st, layers, first, affected: null, dead: false, started: false });
          }
        }
      }
    }
    const active = runs.filter((r) => !r.dead).map((r) => r.st);
    g.derived = { version: s.version, chars: work, statics: active };
  } finally {
    g.computing = null;
  }
}

function ensure(g: G): void {
  if (!g.derived || g.derived.version !== g.state.version) computeAll(g);
}

/** características atuais de um objeto */
export function chars(g: G, id: ObjId): Chars {
  if (g.computing) {
    const c = g.computing.get(id);
    if (c) return c;
    const o = g.state.objects[id];
    if (o) return layer1(g, o);
    const l = g.state.lki[id];
    if (l) return l.chars;
    throw new Error(`Objeto inexistente: ${id}`);
  }
  ensure(g);
  const d = g.derived!;
  let c = d.chars.get(id);
  if (c) return c;
  const o = g.state.objects[id];
  if (!o) {
    const l = g.state.lki[id];
    if (l) return l.chars;
    throw new Error(`Objeto inexistente: ${id}`);
  }
  c = layer1(g, o);
  // efeitos resolvidos que afetam diretamente objetos fora do campo (ex.: mágica na pilha que ganha wither)
  for (const L of LAYERS) for (const e of g.state.effects) {
    if (!e.affected?.includes(id)) continue;
    for (const m of e.mods) if (modLayer(m) === L) applyMod(c, m);
  }
  d.chars.set(id, c);
  return c;
}

export function activeStatics(g: G): ActiveStatic[] {
  ensure(g);
  return g.derived!.statics;
}

/** funções de regra ativas para um gancho (estáticas no campo e efeitos resolvidos) */
export function hooks<K extends keyof RuleHooks>(g: G, key: K): { fn: NonNullable<RuleHooks[K]>; ctx: SCtx }[] {
  const out: { fn: NonNullable<RuleHooks[K]>; ctx: SCtx }[] = [];
  for (const st of activeStatics(g)) {
    const fn = st.def.rules?.[key];
    if (!fn) continue;
    const ctx = { g, you: st.controller, source: st.source };
    if (st.def.condition && !st.def.condition(ctx)) continue;
    out.push({ fn: fn as NonNullable<RuleHooks[K]>, ctx });
  }
  // efeitos de regra criados por mágicas/habilidades resolvidas: Mod { k: 'rule', id }
  for (const e of g.state.effects) for (const m of e.mods) {
    if (m.k !== 'rule') continue;
    const def = registry.abilities.get(m.id);
    if (!def || def.kind !== 'static') continue;
    const fn = def.rules?.[key];
    if (fn) out.push({ fn: fn as NonNullable<RuleHooks[K]>, ctx: { g, you: e.controller, source: e.source, ...(m.params ? { params: m.params, effect: e } : { effect: e }) } as SCtx });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------
export function hasKw(g: G, id: ObjId, kw: string): boolean {
  return chars(g, id).abilities.some((a) => a.kw === kw);
}

export function kwParams(g: G, id: ObjId, kw: string): unknown[] {
  return chars(g, id).abilities.filter((a) => a.kw === kw).map((a) => a.param);
}

export function isType(g: G, id: ObjId, type: string): boolean {
  return chars(g, id).types.includes(type);
}

export function isSubtype(g: G, id: ObjId, sub: string): boolean {
  return chars(g, id).subtypes.includes(sub);
}

export function isCreature(g: G, id: ObjId): boolean {
  return isType(g, id, 'Creature');
}

export function isLand(g: G, id: ObjId): boolean {
  return isType(g, id, 'Land');
}

export function isLegendary(g: G, id: ObjId): boolean {
  return chars(g, id).supertypes.includes('Legendary');
}

export const PERMANENT_TYPES = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];

export function isPermanentCard(g: G, id: ObjId): boolean {
  return chars(g, id).types.some((t) => PERMANENT_TYPES.includes(t));
}

export function power(g: G, id: ObjId): number {
  return chars(g, id).power ?? 0;
}

export function toughness(g: G, id: ObjId): number {
  return chars(g, id).toughness ?? 0;
}

export function colorsOf(g: G, id: ObjId): Color[] {
  return chars(g, id).colors;
}

export function controllerOf(g: G, id: ObjId): PlayerId {
  const o = g.state.objects[id];
  if (!o) return g.state.lki[id]?.chars.controller ?? 0;
  if (o.zone === 'battlefield') return chars(g, id).controller;
  if (o.zone === 'stack') return o.stack?.controller ?? o.controller;
  return o.owner; // CR 108.4a
}

export function nameOf(g: G, id: ObjId): string {
  const c = chars(g, id);
  return c.name || 'carta virada para baixo';
}

export function manaValue(g: G, id: ObjId): number {
  return chars(g, id).manaValue;
}

/** habilidades de uma definição com o tipo pedido, resolvidas no registro */
export function abilityDefs(g: G, id: ObjId): { inst: AbilityInst; def: AbilityDef }[] {
  const out: { inst: AbilityInst; def: AbilityDef }[] = [];
  for (const inst of chars(g, id).abilities) {
    const def = registry.abilities.get(inst.id);
    if (def) out.push({ inst, def });
  }
  return out;
}
