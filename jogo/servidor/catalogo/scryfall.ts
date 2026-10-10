// Dados das cartas novas no Scryfall: a impressão do deck (POST /cards/collection, 75 por pedido), a impressão
// em português (busca por oracle id), rulings, fichas que a carta cria e as imagens. A escolha da impressão
// segue a regra de ../cartas/coletar.py (printing_score), para as cartas novas ficarem iguais às antigas.

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ErroRede, type Rede } from './rede.ts';
import type { ImagemLocal, Printing, Ruling, ScryCard, ScryFace, ScryObjeto } from './tipos.ts';

const API = 'https://api.scryfall.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function colecao(rede: Rede, ids: string[]): Promise<{ cartas: ScryObjeto[]; faltam: string[] }> {
  const cartas: ScryObjeto[] = [];
  const faltam: string[] = [];
  const unicos = [...new Set(ids.filter((id) => UUID.test(id)))];
  for (let i = 0; i < unicos.length; i += 75) {
    const lote = unicos.slice(i, i + 75);
    const r = await rede.json<{ data: ScryObjeto[]; not_found?: { id?: string }[] }>(`${API}/cards/collection`, { metodo: 'POST', corpo: { identifiers: lote.map((id) => ({ id })) } });
    cartas.push(...(r.data ?? []).filter((c) => c?.object === 'card'));
    for (const n of r.not_found ?? []) if (n.id) faltam.push(n.id);
  }
  return { cartas, faltam };
}

/** carta pelo nome exato (quando o Moxfield não diz a impressão ou ela sumiu do Scryfall) */
export async function porNome(rede: Rede, nome: string): Promise<ScryObjeto | null> {
  try {
    return await rede.json<ScryObjeto>(`${API}/cards/named?exact=${encodeURIComponent(nome)}`);
  } catch (e) {
    if (e instanceof ErroRede && e.tipo === 'nao-encontrado') return null;
    throw e;
  }
}

/** todas as impressões de uma carta num idioma (lista vazia se não houver) */
export async function impressoes(rede: Rede, oracleId: string, lang: 'pt' | 'en'): Promise<ScryObjeto[]> {
  if (!UUID.test(oracleId)) return [];
  const q = encodeURIComponent(`oracleid:${oracleId} lang:${lang}`);
  try {
    const r = await rede.json<{ data: ScryObjeto[] }>(`${API}/cards/search?q=${q}&unique=prints&include_extras=true&include_multilingual=true`);
    return (r.data ?? []).filter((c) => c.lang === lang);
  } catch (e) {
    if (e instanceof ErroRede && e.tipo === 'nao-encontrado') return [];
    throw e;
  }
}

export async function rulings(rede: Rede, id: string): Promise<Ruling[]> {
  if (!UUID.test(id)) return [];
  const r = await rede.json<{ data: (Ruling & { oracle_id?: string })[] }>(`${API}/cards/${id}/rulings`);
  return (r.data ?? []).map((x) => ({ source: x.source, published_at: x.published_at, comment: x.comment }));
}

/** a mesma ordem de preferência de coletar.py: mesma edição e número, mesma edição, papel, imagem em alta, mais nova */
export function nota(c: ScryObjeto, preferida?: ScryObjeto | null): (boolean | string)[] {
  return [
    !!preferida && c.set === preferida.set && c.collector_number === preferida.collector_number,
    !!preferida && c.set === preferida.set,
    !c.digital,
    (c.games ?? []).includes('paper'),
    !!c.highres_image,
    c.image_status === 'highres_scan',
    c.released_at ?? '',
    c.id,
  ];
}

export function escolherImpressao(cands: ScryObjeto[], preferida?: ScryObjeto | null): ScryObjeto | null {
  let melhor: ScryObjeto | null = null;
  let nm: (boolean | string)[] = [];
  for (const c of cands) {
    const n = nota(c, preferida);
    if (!melhor || maior(n, nm)) { melhor = c; nm = n; }
  }
  return melhor;
}

function maior(a: (boolean | string)[], b: (boolean | string)[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (typeof a[i] === 'boolean') return a[i] === true;
    return String(a[i]) > String(b[i]);
  }
  return false;
}

const oracleIdDe = (o: ScryObjeto) => o.oracle_id ?? o.card_faces?.[0]?.oracle_id ?? '';

function faceOracle(f: ScryFace): ScryFace {
  return {
    name: f.name, mana_cost: f.mana_cost ?? '', type_line: f.type_line ?? '', oracle_text: f.oracle_text ?? '',
    power: f.power ?? null, toughness: f.toughness ?? null, loyalty: f.loyalty ?? null,
    colors: f.colors ?? [], ...(f.color_indicator ? { color_indicator: f.color_indicator } : {}),
  };
}

/** identidade de jogo da carta (formato de ../cartas/data/cards.json) */
export function paraCarta(o: ScryObjeto, impressoes: string[]): ScryCard {
  const oid = oracleIdDe(o);
  return {
    id: oid, oracle_id: oid, name: o.name, layout: o.layout, cmc: o.cmc ?? 0,
    mana_cost: o.mana_cost ?? '', type_line: o.type_line ?? '', oracle_text: o.oracle_text ?? '',
    power: o.power ?? null, toughness: o.toughness ?? null, loyalty: o.loyalty ?? null,
    colors: o.colors ?? [], color_identity: o.color_identity ?? [], keywords: o.keywords ?? [],
    ...(o.color_indicator ? { color_indicator: o.color_indicator } : {}),
    legalities: o.legalities ? { commander: o.legalities.commander } : {},
    card_faces: o.card_faces?.length ? o.card_faces.map(faceOracle) : null,
    all_parts: o.all_parts?.map((p) => ({ id: p.id, component: p.component, name: p.name })) ?? null,
    printing_ids: [...new Set(impressoes)].sort(),
  };
}

/** impressão (formato de ../cartas/data/printings.json, só os campos que o jogo usa) */
export function paraImpressao(o: ScryObjeto, imagens: ImagemLocal[]): Printing {
  return {
    id: o.id, oracle_id: oracleIdDe(o), name: o.name, lang: o.lang, layout: o.layout, set: o.set, collector_number: o.collector_number,
    type_line: o.type_line, oracle_text: o.oracle_text, power: o.power ?? null, toughness: o.toughness ?? null, colors: o.colors ?? [],
    printed_name: o.printed_name ?? null, printed_type_line: o.printed_type_line ?? null, printed_text: o.printed_text ?? null,
    card_faces: o.card_faces?.map((f) => ({ ...faceOracle(f), printed_name: f.printed_name, printed_type_line: f.printed_type_line, printed_text: f.printed_text })) ?? null,
    image_status: o.image_status,
    local_images: imagens,
  };
}

/** imagens da impressão: a frente e, nas cartas de duas faces com imagens separadas, o verso */
export function imagensDe(o: ScryObjeto): { face: 'front' | 'back'; url: string }[] {
  if (o.image_uris?.png) return [{ face: 'front', url: o.image_uris.png }];
  const faces = (o.card_faces ?? []).map((f) => f.image_uris?.png).filter((u): u is string => !!u);
  return faces.slice(0, 2).map((url, i) => ({ face: i === 0 ? 'front' : 'back', url }));
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pngValido = (b: Buffer) => b.length > 64 && b.subarray(0, 8).equals(PNG);

/** baixa as imagens que ainda não estão na pasta (<pasta>/<id>/front.png e back.png) */
export async function baixarImagens(rede: Rede, o: ScryObjeto, pasta: string): Promise<ImagemLocal[]> {
  if (!UUID.test(o.id)) return [];
  const out: ImagemLocal[] = [];
  for (const { face, url } of imagensDe(o)) {
    const dir = join(pasta, o.id);
    const arq = join(dir, `${face}.png`);
    if (!existsSync(arq) || !pngValido(readFileSync(arq))) {
      const b = await rede.binario(url);
      if (!pngValido(b)) throw new Error(`Imagem inválida do Scryfall: ${o.name}`);
      mkdirSync(dir, { recursive: true });
      // nome próprio: duas importações juntas podem baixar a mesma imagem (no Windows, trocar o mesmo temporário falha)
      const parcial = `${arq}.${randomBytes(4).toString('hex')}.parcial`;
      writeFileSync(parcial, b);
      renameSync(parcial, arq);
    }
    out.push({ face, path: `imagens/${o.id}/${face}.png`, source_url: url });
  }
  return out;
}

/** fichas (e resultados de meld) que a carta cria, pela relação `all_parts` do Scryfall (como coletar.py) */
export function partesFicha(o: ScryObjeto): string[] {
  if (ehFicha(o)) return [];
  return (o.all_parts ?? []).filter((p) => p.id !== o.id && (p.component === 'token' || p.component === 'meld_result')).map((p) => p.id);
}

/** ficha, emblema ou objeto auxiliar (nunca percorre as relações a partir deles) */
export function ehFicha(o: { layout: string; type_line?: string }): boolean {
  const tipo = o.type_line ?? '';
  return o.layout === 'token' || o.layout === 'double_faced_token' || o.layout === 'emblem' || tipo.startsWith('Token') || tipo.startsWith('Emblem');
}

export { oracleIdDe };
