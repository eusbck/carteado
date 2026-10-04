// Mana: leitura de custos, valor de mana, cores do custo e pagamento a partir da reserva.
// CR 106 (mana), 107.4 (símbolos), 202.3 (valor de mana), 118.7 (redução de custo).

import type { Color, ManaSymbol, ManaType, ManaUnit } from './types.ts';

const COLOR_SET = new Set(['W', 'U', 'B', 'R', 'G']);

export function parseCost(text: string | null | undefined): ManaSymbol[] {
  if (!text) return [];
  const out: ManaSymbol[] = [];
  for (const m of text.matchAll(/\{([^}]+)\}/g)) {
    const s = m[1].toUpperCase();
    if (/^\d+$/.test(s)) out.push({ k: 'generic', n: Number(s) });
    else if (s === 'X') out.push({ k: 'X' });
    else if (s === 'C') out.push({ k: 'C' });
    else if (s === 'S') out.push({ k: 'snow' });
    else if (COLOR_SET.has(s)) out.push({ k: 'color', c: s as Color });
    else if (/^[WUBRG]\/P$/.test(s)) out.push({ k: 'phyrexian', c: s[0] as Color });
    else if (/^\d+\/[WUBRG]$/.test(s)) out.push({ k: 'monohybrid', n: Number(s.split('/')[0]), c: s.split('/')[1] as Color });
    else if (/^[WUBRG]\/[WUBRG]$/.test(s)) out.push({ k: 'hybrid', a: s[0] as Color, b: s[2] as Color });
    else throw new Error(`Símbolo de mana desconhecido: {${s}}`);
  }
  return out;
}

export function formatCost(cost: ManaSymbol[]): string {
  if (cost.length === 0) return '{0}';
  return cost.map((s) => {
    switch (s.k) {
      case 'generic': return `{${s.n}}`;
      case 'X': return '{X}';
      case 'C': return '{C}';
      case 'snow': return '{S}';
      case 'color': return `{${s.c}}`;
      case 'hybrid': return `{${s.a}/${s.b}}`;
      case 'monohybrid': return `{${s.n}/${s.c}}`;
      case 'phyrexian': return `{${s.c}/P}`;
    }
  }).join('');
}

/** CR 202.3: valor de mana; X vale 0 fora da pilha (107.3g) ou o valor anunciado */
export function manaValueOf(cost: ManaSymbol[] | null, x = 0): number {
  if (!cost) return 0;
  let n = 0;
  for (const s of cost) {
    switch (s.k) {
      case 'generic': n += s.n; break;
      case 'X': n += x; break;
      case 'monohybrid': n += Math.max(s.n, 1); break; // CR 202.3f
      default: n += 1;
    }
  }
  return n;
}

/** CR 105.2 e 202.2: cores de um objeto pelo seu custo de mana */
export function colorsOfCost(cost: ManaSymbol[] | null): Color[] {
  const set = new Set<Color>();
  for (const s of cost ?? []) {
    if (s.k === 'color' || s.k === 'phyrexian' || s.k === 'monohybrid') set.add(s.c);
    if (s.k === 'hybrid') { set.add(s.a); set.add(s.b); }
  }
  return (['W', 'U', 'B', 'R', 'G'] as Color[]).filter((c) => set.has(c));
}

/** substitui {X} por genérico de valor x (CR 107.3a) e junta os genéricos */
export function withX(cost: ManaSymbol[], x: number): ManaSymbol[] {
  const out: ManaSymbol[] = [];
  let generic = 0;
  for (const s of cost) {
    if (s.k === 'X') generic += x;
    else if (s.k === 'generic') generic += s.n;
    else out.push(s);
  }
  return generic > 0 ? [{ k: 'generic', n: generic }, ...out] : out;
}

export function genericOf(cost: ManaSymbol[]): number {
  return cost.reduce((n, s) => n + (s.k === 'generic' ? s.n : 0), 0);
}

/** CR 118.7a: reduz só a parte genérica */
export function reduceGeneric(cost: ManaSymbol[], amount: number): ManaSymbol[] {
  if (amount <= 0) return cost;
  let left = amount;
  const out: ManaSymbol[] = [];
  for (const s of cost) {
    if (s.k === 'generic' && left > 0) {
      const cut = Math.min(s.n, left);
      left -= cut;
      if (s.n - cut > 0) out.push({ k: 'generic', n: s.n - cut });
    } else out.push(s);
  }
  return out;
}

export function addGeneric(cost: ManaSymbol[], amount: number): ManaSymbol[] {
  if (amount <= 0) return cost;
  return withX([{ k: 'generic', n: amount }, ...cost], 0);
}

/** quantas unidades de mana o custo exige no mínimo (para estimar se dá para pagar) */
export function minimumUnits(cost: ManaSymbol[]): number {
  let n = 0;
  for (const s of cost) {
    if (s.k === 'generic') n += s.n;
    else if (s.k === 'phyrexian') n += 0;
    else if (s.k !== 'X') n += 1;
  }
  return n;
}

export interface SpendContext {
  /** a unidade pode pagar este custo? (restrições de gasto, CR 106.6) */
  canSpend?: (unit: ManaUnit) => boolean;
  /** "mana de qualquer tipo pode ser gasta" (CR 118.14) */
  anyType?: boolean;
  /** quantos símbolos phyrexianos serão pagos com 2 de vida (CR 107.4f) */
  lifeForPhyrexian?: number;
}

/**
 * Tenta pagar o custo inteiro com a reserva. Devolve os índices das unidades usadas
 * (na ordem dos símbolos) ou null se não for possível (pagamentos parciais não são
 * permitidos, CR 601.2h). Busca com retrocesso: os símbolos mais restritos primeiro.
 */
export function matchPool(cost: ManaSymbol[], pool: ManaUnit[], ctx: SpendContext = {}): number[] | null {
  const usable = pool.map((u, i) => ({ u, i })).filter(({ u }) => !ctx.canSpend || ctx.canSpend(u));
  let lifeLeft = ctx.lifeForPhyrexian ?? 0;
  // cada exigência é uma lista de alternativas; cada alternativa é uma lista de "slots" (tipos aceitos)
  type Slot = (t: ManaType) => boolean;
  const reqs: { alts: Slot[][]; weight: number }[] = [];
  const any: Slot = () => true;
  const of = (c: ManaType): Slot => (t) => ctx.anyType || t === c;
  for (const s of cost) {
    switch (s.k) {
      case 'generic': for (let i = 0; i < s.n; i++) reqs.push({ alts: [[any]], weight: 0 }); break;
      case 'C': reqs.push({ alts: [[of('C')]], weight: 3 }); break;
      case 'color': reqs.push({ alts: [[of(s.c)]], weight: 3 }); break;
      case 'hybrid': reqs.push({ alts: [[of(s.a)], [of(s.b)]], weight: 2 }); break;
      case 'monohybrid': reqs.push({ alts: [[of(s.c)], Array.from({ length: s.n }, () => any)], weight: 1 }); break;
      case 'phyrexian':
        if (lifeLeft > 0) { lifeLeft--; break; }
        reqs.push({ alts: [[of(s.c)]], weight: 3 });
        break;
      case 'snow': reqs.push({ alts: [[() => false]], weight: 3 }); break;
      case 'X': break;
    }
  }
  reqs.sort((a, b) => b.weight - a.weight);
  const used = new Set<number>();
  const chosen: number[] = [];
  // ordem de preferência das unidades para genérico: incolor primeiro, depois cores menos "valiosas"
  const order = [...usable].sort((a, b) => (a.u.type === 'C' ? -1 : 0) - (b.u.type === 'C' ? -1 : 0));
  let steps = 0;
  function dfs(k: number): boolean {
    if (++steps > 20000) return false;
    if (k === reqs.length) return true;
    for (const alt of reqs[k].alts) {
      const picked: number[] = [];
      let ok = true;
      for (const slot of alt) {
        const cand = order.find(({ u, i }) => !used.has(i) && !picked.includes(i) && slot(u.type));
        if (!cand) { ok = false; break; }
        picked.push(cand.i);
      }
      if (!ok) continue;
      for (const i of picked) used.add(i);
      chosen.push(...picked);
      if (dfs(k + 1)) return true;
      for (const i of picked) used.delete(i);
      chosen.splice(chosen.length - picked.length, picked.length);
    }
    return false;
  }
  return dfs(0) ? chosen : null;
}

export function poolToString(pool: ManaUnit[]): string {
  return pool.map((u) => `{${u.type}}`).join('');
}

export function phyrexianCount(cost: ManaSymbol[]): number {
  return cost.filter((s) => s.k === 'phyrexian').length;
}
