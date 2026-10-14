// Características calculadas pelo sistema de camadas (CR 613).
// Os permanentes são calculados juntos numa passada (as estáticas de uns afetam outros);
// objetos em outras zonas usam os valores copiáveis mais os efeitos que os afetam diretamente.

import { ability, cardDef, registry, type AbilityDef, type RuleHooks, type SCtx, type StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import { manaValueOf } from './mana.ts';
import { BASIC_LAND_MANA, faceManaValue, hasOracle, oracle, CREATURE_SUBTYPES } from './oracle.ts';
import { ehDividida, ehModal, ehSala, FACE_AMBAS, FACE_NENHUMA, nomeDaFace, temVariasFaces } from './formatos.ts';
import type { AbilityInst, Chars, Color, CopyValues, GameObject, GameState, Layer, Mod, ObjId, PlayerId, ZoneName } from './types.ts';

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
    case 'setText': return '3';
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
  // dividida com as duas metades juntas: as habilidades de cada metade (CR 709.4c); Sala trancada: nenhuma (709.5)
  const metades = !token && (face === FACE_AMBAS || face === FACE_NENHUMA) && ehDividida(defName);
  const list: AbilityDef[] = token ? (face === 1 && token.back ? token.back.abilities : token.abilities)
    : metades ? (face === FACE_NENHUMA ? [] : (cardDef(defName)?.faces ?? []).slice(0, 2).flatMap((f) => f.abilities ?? []))
      : (cardDef(defName)?.faces[face]?.abilities ?? registry.emblems.get(defName)?.abilities ?? []);
  return list.map((a) => ({ id: a.id!, kw: a.kw, param: a.param }));
}

/** carta que transforma, ou ficha de duas faces (Incubator, CR 111.10i, 701.27a) */
export function isTransform(defName: string): boolean {
  return (hasOracle(defName) && oracle(defName).layout === 'transform') || !!registry.tokens.get(defName)?.back;
}

/** modelos das características impressas por definição e face (só leitura): recalcular a cada passada das camadas
 *  pesava nas simulações dos bots. Valem enquanto o registro de definições não muda de tamanho. */
const impressas = new Map<string, Chars>();
let impressasChave = '';

/** características impressas de uma definição (carta ou ficha) e face */
export function printedChars(defName: string, face: number, owner: PlayerId): Chars {
  const chave = `${registry.cards.size}:${registry.tokens.size}:${registry.abilities.size}`;
  if (chave !== impressasChave) { impressas.clear(); impressasChave = chave; }
  const k = `${defName}|${face}`;
  let m = impressas.get(k);
  if (!m) { m = printedCharsNovas(defName, face, owner); impressas.set(k, m); }
  return {
    ...m, controller: owner, colors: [...m.colors], supertypes: [...m.supertypes], types: [...m.types], subtypes: [...m.subtypes],
    abilities: m.abilities.map((a) => ({ ...a })),
  };
}

/** a definição impressa tem alguma estática que funciona fora do campo? */
function impressaFunciona(defName: string, face: number, off: Set<string>): boolean {
  return printedChars(defName, face, 0).abilities.some((a) => off.has(a.id));
}

function printedCharsNovas(defName: string, face: number, owner: PlayerId): Chars {
  const token = registry.tokens.get(defName);
  if (token) {
    // ficha de duas faces com o verso para cima: só as características do verso (CR 712.8e)
    const f = face === 1 && token.back ? token.back : token;
    return {
      name: f.name, manaCost: null, manaValue: 0, colors: [...f.colors],
      supertypes: [...(f.supertypes ?? [])], types: [...f.types], subtypes: [...f.subtypes],
      abilities: abilitiesOfDef(defName, face), power: f.power, toughness: f.toughness, loyalty: null, controller: owner,
    };
  }
  // emblema (CR 114.3): sem tipos, custo nem cor; só as habilidades
  const emblema = registry.emblems.get(defName);
  if (emblema) return { name: emblema.name, manaCost: null, manaValue: 0, colors: [], supertypes: [], types: [], subtypes: [], abilities: abilitiesOfDef(defName, 0), power: null, toughness: null, loyalty: null, controller: owner };
  const card = oracle(defName);
  if (card.layout === 'split' && (face === FACE_AMBAS || face === FACE_NENHUMA)) return metadesJuntas(defName, face, owner);
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

/**
 * Carta dividida com as duas metades juntas (CR 709.4): fora da pilha, fundida na pilha (709.4d) e Sala com as duas
 * portas destrancadas (709.5). Custo de mana somado, cores e valor de mana dele (709.4b), tipos e habilidades das
 * duas (709.4c); o nome é o das duas ("Dusk // Dawn", 709.4a). Sala sem porta destrancada (FACE_NENHUMA): só a linha
 * de tipo compartilhada, sem nome, custo nem habilidades (709.5, 709.5a).
 */
function metadesJuntas(defName: string, face: number, owner: PlayerId): Chars {
  const [a, b] = oracle(defName).faces;
  const uniao = (x: string[], y: string[]) => [...x, ...y.filter((t) => !x.includes(t))];
  if (face === FACE_NENHUMA) {
    return { name: '', manaCost: null, manaValue: 0, colors: [], supertypes: [...a.supertypes], types: [...a.types], subtypes: [...a.subtypes], abilities: [], power: null, toughness: null, loyalty: null, controller: owner };
  }
  const custo = [...(a.manaCost ?? []), ...(b.manaCost ?? [])];
  const ordem: Color[] = ['W', 'U', 'B', 'R', 'G'];
  return {
    name: nomeDaFace(defName, FACE_AMBAS),
    manaCost: custo.length ? custo : null,
    manaValue: manaValueOf(a.manaCost) + manaValueOf(b.manaCost),
    colors: ordem.filter((c) => a.colors.includes(c) || b.colors.includes(c)),
    supertypes: uniao(a.supertypes, b.supertypes), types: uniao(a.types, b.types), subtypes: uniao(a.subtypes, b.subtypes),
    abilities: abilitiesOfDef(defName, FACE_AMBAS),
    power: null, toughness: null, loyalty: null, controller: owner,
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
  if (e.noManaCost) { c.manaCost = null; c.manaValue = 0; }
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


/**
 * Face em uso. No campo e na pilha, a que está para cima (transformar, CR 712.8d-e; modal de duas faces, 712.8f) ou a
 * metade conjurada (dividida, 709.3b; aventura, 715.3b); a Sala no campo guarda as portas destrancadas (709.5). Nas
 * outras zonas vale a frente (712.8a, 715.4), e a dividida tem as duas metades juntas (709.4).
 */
export function currentFace(o: GameObject): number {
  if (o.copyOf) return o.copyOf.face;
  if ((o.zone === 'battlefield' || o.zone === 'stack') && (isTransform(o.def) || temVariasFaces(o.def))) return o.face;
  if (ehDividida(o.def)) return FACE_AMBAS;
  return 0; // preparação: só as características normais em todas as zonas (CR 722.4)
}

/** face com que um objeto entra no campo vindo desta zona: a da mágica (CR 712.13; a porta conjurada, 709.5d) ou a
 *  frente (712.14); a Sala que não veio da pilha entra trancada (709.5d) */
export function faceAoEntrar(o: GameObject): number {
  if (o.zone === 'stack') return o.face;
  return ehSala(o.copyOf?.def ?? o.def) && !o.copyOf ? FACE_NENHUMA : 0;
}

/** pode transformar: carta que transforma, ficha de duas faces e modal de duas faces com a habilidade (CR 712.3, 712.9) */
export function canTransform(defName: string): boolean {
  return isTransform(defName) || ehModal(defName);
}

/** CR 708.2a: permanente ou mágica virada para baixo é uma criatura 2/2 sem nome nem habilidades */
function faceDownChars(owner: PlayerId): Chars {
  return { name: '', manaCost: null, manaValue: 0, colors: [], supertypes: [], types: ['Creature'], subtypes: [], abilities: [], power: 2, toughness: 2, loyalty: null, controller: owner };
}

/** efeitos de cópia (camada 1a) de cada objeto, calculados uma vez por versão do estado */
const indiceCopias = new WeakMap<G, { versao: number; efeitos: GameState['effects']; mapa: Map<ObjId, GameState['effects']> }>();
function copiasDe(g: G, id: ObjId): GameState['effects'] {
  let ix = indiceCopias.get(g);
  if (!ix || ix.versao !== g.state.version || ix.efeitos !== g.state.effects) {
    const mapa = new Map<ObjId, GameState['effects']>();
    for (const e of g.state.effects) {
      if (!e.affected || !e.mods.some((m) => m.k === 'copy')) continue;
      for (const a of e.affected) { const l = mapa.get(a); if (l) l.push(e); else mapa.set(a, [e]); }
    }
    ix = { versao: g.state.version, efeitos: g.state.effects, mapa };
    indiceCopias.set(g, ix);
  }
  return [...(ix.mapa.get(id) ?? [])];
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
    const copies = copiasDe(g, o.id);
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
    case 'addTypes': {
      for (const t of m.types ?? []) if (!c.types.includes(t)) c.types.push(t);
      // polimorfo acrescenta centenas de tipos de criatura (CR 702.73a): conjunto para não ficar quadrático
      const tem = new Set(c.subtypes);
      for (const t of m.subtypes ?? []) if (!tem.has(t)) { c.subtypes.push(t); tem.add(t); }
      for (const t of m.supertypes ?? []) if (!c.supertypes.includes(t)) c.supertypes.push(t);
      break;
    }
    case 'setTypes':
      c.types = [...m.types];
      c.subtypes = [...m.subtypes];
      if (!m.keepSupertypes) c.supertypes = c.supertypes.filter((s) => s === 'Legendary' || s === 'Basic');
      break;
    case 'removeTypes': c.types = c.types.filter((t) => !m.types.includes(t)); break;
    case 'setColors': c.colors = [...m.colors]; break;
    case 'setText': c.abilities = m.abilities.map((a) => ({ ...a })); break;
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

/** marcadores de palavra-chave (CR 122.1b) */
export const KEYWORD_COUNTERS: ReadonlySet<string> = new Set([
  'flying', 'first strike', 'double strike', 'deathtouch', 'decayed', 'exalted', 'haste', 'hexproof', 'indestructible',
  'lifelink', 'menace', 'reach', 'shadow', 'trample', 'vigilance',
]);

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
          const o = s.objects[id];
          // sem cópia, as habilidades são as impressas: se nenhuma funciona fora do campo, não precisa calcular
          if (!o.copyOf && !o.faceDown && !copiasDe(g, id).length && !impressaFunciona(o.def, currentFace(o), off)) continue;
          const c = layer1(g, o);
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
      // marcadores de palavra-chave (CR 122.1b) dão a palavra-chave na camada 6 (613.1f)
      if (L === '6') {
        for (const id of bf) {
          const c = work.get(id)!;
          for (const [k, n] of Object.entries(s.objects[id].counters)) if (n > 0 && KEYWORD_COUNTERS.has(k)) c.abilities.push({ id: `kw:${k}`, kw: k });
        }
      }
      for (const en of entries) for (const id of en.objs) {
        const c = work.get(id);
        if (!c) continue;
        for (const m of en.mods(id)) applyMod(c, m);
      }
      if (L === '2') {
        // CR 613.1b: depois dos efeitos de controle, "você" de uma estática do campo é quem controla a fonte agora
        for (const r of runs) if (r.st.zone === 'battlefield' && !r.started) r.st.controller = work.get(r.st.source)?.controller ?? r.st.controller;
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
    // Objeto fora do campo consultado durante a passada das camadas (CDA de carta exilada lida pelo Duplicant):
    // calculado na hora e NÃO gravado em g.computing, que vira o cache desta versão. A CDA lê o campo como
    // ele está neste momento da passada (CR 613.1: as camadas ainda não terminaram); gravar o valor faria
    // a consulta seguinte (ou a leitura depois da passada) usar um valor sem as trocas de controle e tipo.
    if (o) {
      // sem CDA, o valor não depende do campo e pode ficar num cache só desta passada (fora de g.computing)
      let fixos = foraDoCampoNaPassada.get(g.computing);
      if (!fixos) { fixos = new Map(); foraDoCampoNaPassada.set(g.computing, fixos); }
      const fixo = fixos.get(id);
      if (fixo) return fixo;
      const c = offFieldChars(g, o);
      if (!temCda(c)) fixos.set(id, c);
      return c;
    }
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
  // fora da passada, o campo já está com todas as camadas aplicadas: o valor pode ficar no cache da versão
  c = offFieldChars(g, o);
  d.chars.set(id, c);
  return c;
}

/** objetos fora do campo sem CDA já calculados na passada atual (a chave é o mapa de trabalho da passada) */
const foraDoCampoNaPassada = new WeakMap<Map<ObjId, Chars>, Map<ObjId, Chars>>();

function temCda(c: Chars): boolean {
  return c.abilities.some((a) => { const def = registry.abilities.get(a.id); return def?.kind === 'static' && !!def.cda; });
}

/** objetos cujas CDAs estão sendo avaliadas agora (guarda de recursão local, por objeto do estado) */
const emAvaliacao = new Set<GameObject>();

/** características de um objeto fora do campo: valores copiáveis, CDAs (CR 604.3: funcionam em todas as zonas) e
 *  efeitos resolvidos que o afetam diretamente (ex.: mágica na pilha que ganha wither) */
function offFieldChars(g: G, o: GameObject): Chars {
  const c = layer1(g, o);
  // uma CDA que conta a própria carta (Soulless One no cemitério) lê os valores impressos, sem recursão
  if (emAvaliacao.has(o)) return c;
  emAvaliacao.add(o);
  try { applyCdas(g, o, c); } finally { emAvaliacao.delete(o); }
  // estáticas do campo que alcançam objetos fora dele (Maskwood Nexus). Só fora da passada das camadas, quando as
  // estáticas ativas já estão calculadas
  if (!g.computing && g.derived) {
    for (const st of g.derived.statics) {
      if (!st.def.offField || !st.def.affects || !st.def.mods) continue;
      const ctx: SCtx = { g, you: st.controller, source: st.source };
      if (st.def.condition && !st.def.condition(ctx)) continue;
      if (!st.def.affects(ctx, o)) continue;
      for (const m of st.def.mods(ctx, o)) applyMod(c, m);
    }
  }
  for (const L of LAYERS) for (const e of g.state.effects) {
    if (!e.affected?.includes(o.id)) continue;
    for (const m of e.mods) if (modLayer(m) === L) applyMod(c, m);
  }
  return c;
}

function applyCdas(g: G, o: GameObject, c: Chars): void {
  for (const inst of c.abilities) {
    const def = registry.abilities.get(inst.id);
    if (def?.kind !== 'static' || !def.cda || !def.mods) continue;
    const ctx: SCtx = { g, you: o.owner, source: o.id };
    if (def.affects && !def.affects(ctx, o)) continue;
    try { for (const m of def.mods(ctx, o)) applyMod(c, m); } catch { /* sem as características esperadas fora do campo */ }
  }
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
/** CR 305.2: quantos terrenos o jogador pode jogar neste turno: um, mais os de efeitos que resolveram (Explore) e os de
 *  efeitos contínuos (gancho extraLandPlays) */
export function landPlaysAllowed(g: G, p: PlayerId): number {
  return 1 + (g.state.turn.extraLands ?? 0) + hooks(g, 'extraLandPlays').reduce((n, h) => n + Math.max(0, h.fn(h.ctx, p)), 0);
}

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
  if (c.name) return c.name;
  // Sala sem porta destrancada não tem nome (CR 709.5); para a mesa e o registro, o da carta
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  if (o && !o.faceDown && ehSala(o.def)) return `${nomeDaFace(o.def, FACE_AMBAS)} (trancada)`;
  return 'carta virada para baixo';
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
