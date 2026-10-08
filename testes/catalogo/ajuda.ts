// Ajuda dos testes do catálogo de decks: rede falsa (Moxfield e Scryfall sem internet), pastas temporárias com
// uma cópia de decks/ e gerado/, e cartas inventadas para fazer o papel de cartas novas.

import { copyFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Pastas } from '../../servidor/catalogo/caminhos.ts';
import { ErroRede, type Rede } from '../../servidor/catalogo/rede.ts';
import type { ScryObjeto } from '../../servidor/catalogo/tipos.ts';

const RAIZ = join(import.meta.dirname, '..', '..');

export const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(120, 7)]);

type Rota = (url: URL, corpo: unknown) => unknown;

/** rede falsa: cada pedido passa pelas rotas; um valor ErroRede vira erro; `pedidos` guarda o que foi pedido */
export class RedeFalsa implements Rede {
  pedidos: string[] = [];
  moxfield = new Map<string, unknown>();
  cartas = new Map<string, ScryObjeto>();
  rulings = new Map<string, { source: string; published_at: string; comment: string }[]>();
  /** urls que falham (para testar erro no meio) */
  falhar = new Set<string>();
  extras: Rota[] = [];

  deck(id: string, resposta: unknown): this { this.moxfield.set(`v3:${id}`, resposta); return this; }
  carta(...cs: ScryObjeto[]): this { for (const c of cs) this.cartas.set(c.id, c); return this; }

  async json<T>(url: string, o: { metodo?: 'GET' | 'POST'; corpo?: unknown } = {}): Promise<T> {
    this.pedidos.push(`${o.metodo ?? 'GET'} ${url}`);
    const u = new URL(url);
    if (this.falhar.has(url)) throw new ErroRede('http', url, 500, 'falha de teste');
    for (const r of this.extras) { const v = r(u, o.corpo); if (v !== undefined) return v as T; }
    if (u.hostname === 'api2.moxfield.com') {
      // chave "v3:<id>" ou "v2:<id>" (deck(id, resposta) põe na v3)
      const m = u.pathname.match(/^\/(v[23])\/decks\/all\/(.+)$/);
      const d = m ? this.moxfield.get(`${m[1]}:${m[2]}`) : undefined;
      if (d instanceof ErroRede) throw d;
      if (!d) throw new ErroRede('nao-encontrado', url, 404, 'não achou');
      return structuredClone(d) as T;
    }
    if (u.hostname === 'api.scryfall.com') {
      if (u.pathname === '/cards/collection') {
        const ids = (o.corpo as { identifiers: { id: string }[] }).identifiers.map((i) => i.id);
        if (ids.length > 75) throw new Error('lote maior que 75');
        return { data: ids.map((id) => this.cartas.get(id)).filter(Boolean), not_found: ids.filter((id) => !this.cartas.has(id)).map((id) => ({ id })) } as T;
      }
      if (u.pathname === '/cards/named') {
        const c = [...this.cartas.values()].find((x) => x.name === u.searchParams.get('exact') && x.lang === 'en');
        if (!c) throw new ErroRede('nao-encontrado', url, 404, 'não achou');
        return structuredClone(c) as T;
      }
      if (u.pathname === '/cards/search') {
        const q = u.searchParams.get('q') ?? '';
        const oid = q.match(/oracleid:(\S+)/)?.[1];
        const lang = q.match(/lang:(\S+)/)?.[1];
        const lista = [...this.cartas.values()].filter((c) => c.oracle_id === oid && (!lang || c.lang === lang));
        if (!lista.length) throw new ErroRede('nao-encontrado', url, 404, 'nada');
        return { data: structuredClone(lista), has_more: false } as T;
      }
      const r = u.pathname.match(/^\/cards\/([0-9a-f-]{36})\/rulings$/);
      if (r) return { data: this.rulings.get(r[1]) ?? [] } as T;
      const c = u.pathname.match(/^\/cards\/([0-9a-f-]{36})$/);
      if (c && this.cartas.has(c[1])) return structuredClone(this.cartas.get(c[1])) as T;
    }
    throw new ErroRede('nao-encontrado', url, 404, `rota falsa sem resposta: ${url}`);
  }

  async binario(url: string): Promise<Buffer> {
    this.pedidos.push(`GET ${url}`);
    if (this.falhar.has(url)) throw new ErroRede('http', url, 500, 'falha de teste');
    if (new URL(url).hostname === 'cards.scryfall.io') return PNG;
    throw new ErroRede('nao-encontrado', url, 404, 'sem imagem');
  }
}

let seq = 0;
const uuid = (n: number, prefixo: string) => `${prefixo}${String(n).padStart(4, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** carta inventada no formato do Scryfall */
export function cartaFalsa(nome: string, o: Partial<ScryObjeto> & { oracle?: string } = {}): ScryObjeto {
  const n = ++seq;
  const id = o.id ?? uuid(n, 'aaaa');
  return {
    object: 'card', id, oracle_id: o.oracle ?? uuid(n, 'bbbb'), name: nome, lang: 'en', layout: 'normal', set: 'tst', collector_number: String(n),
    cmc: 2, mana_cost: '{2}', type_line: 'Artifact', oracle_text: '{T}: Add {C}.', colors: [], color_identity: [], keywords: [],
    legalities: { commander: 'legal' }, image_uris: { png: `https://cards.scryfall.io/png/front/a/a/${id}.png` },
    games: ['paper'], highres_image: true, image_status: 'highres_scan', released_at: '2026-01-01',
    ...o,
  } as ScryObjeto;
}

export interface EntradaFalsa { nome: string; quantidade?: number; scryfallId?: string | null; ficha?: boolean }

/** resposta da API v3 do Moxfield com o comandante e o deck principal */
export function respostaMox(publicId: string, nome: string, comandante: EntradaFalsa, cartas: EntradaFalsa[], extra: Record<string, unknown> = {}) {
  const zona = (l: EntradaFalsa[]) => ({
    count: l.reduce((n, e) => n + (e.quantidade ?? 1), 0),
    cards: Object.fromEntries(l.map((e, i) => [`u${i}${e.nome.length}`, { quantity: e.quantidade ?? 1, card: { name: e.nome, scryfall_id: e.scryfallId ?? null, set: 'tst', cn: String(i), isToken: !!e.ficha } }])),
  });
  return {
    id: 'interno', name: nome, publicId, version: 3, lastUpdatedAtUtc: '2026-10-01T12:00:00.000Z',
    boards: { commanders: zona([comandante]), mainboard: zona(cartas), sideboard: zona([]), maybeboard: zona([]), companions: zona([]), tokens: zona([]) },
    ...extra,
  };
}

/** pastas temporárias: cópia de decks/ e de gerado/ (sem as artes), ../cartas vazia, imagens e dados vazios */
export function pastasTemp(o: { decks?: boolean } = {}): Pastas {
  const raiz = mkdtempSync(join(tmpdir(), 'catalogo-'));
  const p: Pastas = {
    decks: join(raiz, 'decks'), cartasOriginais: join(raiz, 'cartas'), imagens: join(raiz, 'imagens'),
    gerado: join(raiz, 'gerado'), artes: join(raiz, 'gerado', 'artes'), dados: join(raiz, 'dados'),
  };
  for (const d of Object.values(p)) mkdirSync(d, { recursive: true });
  if (o.decks !== false) for (const f of readdirSync(join(RAIZ, 'decks'))) if (f.endsWith('.json')) copyFileSync(join(RAIZ, 'decks', f), join(p.decks, f));
  for (const f of ['cartas.json', 'imagens.json', 'decks.json']) copyFileSync(join(RAIZ, 'gerado', f), join(p.gerado, f));
  return p;
}
