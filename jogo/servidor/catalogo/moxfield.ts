// Deck do Moxfield pelo link: https://moxfield.com/decks/<publicId>.
// A API pública que o próprio site usa (api2.moxfield.com/v3/decks/all/<id>; a v2 se a v3 não achar) devolve as
// zonas em `boards`. O jogo usa o comandante e o deck principal; reserva, "talvez" e fichas ficam de fora.

import { ErroRede, type Rede } from './rede.ts';

const API = 'https://api2.moxfield.com';
const ID = /^[A-Za-z0-9_-]{8,40}$/;
/** o id solto (sem o link) precisa ser comprido como os do Moxfield (22 caracteres), para não confundir com uma palavra */
const ID_SOLTO = /^[A-Za-z0-9_-]{16,40}$/;

/** id do deck a partir do link (ou do próprio id); null se não for um link de deck do Moxfield */
export function lerLink(texto: string): string | null {
  const s = String(texto ?? '').trim();
  if (ID_SOLTO.test(s)) return s;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.hostname !== 'moxfield.com' && u.hostname !== 'www.moxfield.com') return null;
  const m = u.pathname.match(/^\/decks\/([^/]+)\/?$/);
  return m && ID.test(m[1]) ? m[1] : null;
}

export const linkDoDeck = (id: string) => `https://moxfield.com/decks/${id}`;

export interface EntradaMox {
  nome: string;
  quantidade: number;
  scryfallId: string | null;
  set: string | null;
  numero: string | null;
}

export interface DeckMox {
  publicId: string;
  nome: string;
  versao: number | null;
  atualizadoEm: string | null;
  comandantes: EntradaMox[];
  principal: EntradaMox[];
  /** zonas ignoradas que tinham cartas (para avisar) */
  ignoradas: string[];
}

interface ItemMox {
  quantity?: number;
  card?: { name?: string; scryfall_id?: string | null; set?: string | null; cn?: string | null; isToken?: boolean; layout?: string };
}
interface ZonaMox { count?: number; cards?: Record<string, ItemMox> }
interface RespostaMox {
  publicId?: string; name?: string; version?: number; lastUpdatedAtUtc?: string;
  boards?: Record<string, ZonaMox>;
  [zona: string]: unknown;
}

export class ErroDeck extends Error {}

/** zonas que o jogo não sabe jogar: um deck com cartas nelas não entra */
const RECUSADAS: Record<string, string> = {
  companions: 'companheiro',
  signatureSpells: 'mágica de assinatura',
  attractions: 'atrações',
  stickers: 'adesivos',
  contraptions: 'engenhocas',
  planes: 'planos',
  schemes: 'esquemas',
};
const IGNORADAS: Record<string, string> = { sideboard: 'reserva (sideboard)', maybeboard: '"talvez" (maybeboard)', tokens: 'fichas (tokens)' };

function entradas(z: ZonaMox | undefined): EntradaMox[] {
  const out: EntradaMox[] = [];
  for (const item of Object.values(z?.cards ?? {})) {
    const c = item.card;
    if (!c?.name) continue;
    if (c.isToken) throw new ErroDeck(`${c.name} é uma ficha, não uma carta do deck`);
    const q = Math.trunc(Number(item.quantity ?? 1));
    if (!(q > 0) || q > 250) throw new ErroDeck(`Quantidade inválida para ${c.name}`);
    out.push({ nome: c.name, quantidade: q, scryfallId: c.scryfall_id ?? null, set: c.set ?? null, numero: c.cn ?? null });
  }
  return out;
}

/** a resposta do Moxfield no formato do jogo (v3: zonas em `boards`; v2: zonas no topo) */
export function normalizar(r: RespostaMox, idPedido: string): DeckMox {
  const zonas: Record<string, ZonaMox> = r.boards ?? Object.fromEntries(
    ['commanders', 'mainboard', ...Object.keys(RECUSADAS), ...Object.keys(IGNORADAS)]
      .filter((k) => r[k] && typeof r[k] === 'object')
      .map((k) => [k, { cards: r[k] as Record<string, ItemMox> }]),
  );
  for (const [k, nome] of Object.entries(RECUSADAS)) {
    if (Object.keys(zonas[k]?.cards ?? {}).length) throw new ErroDeck(`O deck usa ${nome}, que o jogo ainda não tem`);
  }
  const comandantes = entradas(zonas.commanders);
  if (comandantes.length === 0) throw new ErroDeck('O deck não tem comandante no Moxfield');
  if (comandantes.length > 1 || comandantes[0].quantidade > 1) throw new ErroDeck('O deck tem mais de um comandante (parceiros ainda não existem no jogo)');
  const principal = entradas(zonas.mainboard);
  // a mesma carta em duas linhas (edições diferentes) vira uma linha só
  const juntas = new Map<string, EntradaMox>();
  for (const e of principal) {
    const j = juntas.get(e.nome);
    if (j) j.quantidade += e.quantidade;
    else juntas.set(e.nome, { ...e });
  }
  const ignoradas = Object.entries(IGNORADAS).filter(([k]) => Object.keys(zonas[k]?.cards ?? {}).length).map(([, n]) => n);
  const nome = String(r.name ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || idPedido;
  return {
    publicId: typeof r.publicId === 'string' && ID.test(r.publicId) ? r.publicId : idPedido,
    nome,
    versao: typeof r.version === 'number' ? r.version : null,
    atualizadoEm: typeof r.lastUpdatedAtUtc === 'string' ? r.lastUpdatedAtUtc : null,
    comandantes,
    principal: [...juntas.values()],
    ignoradas,
  };
}

export async function baixarDeck(rede: Rede, id: string): Promise<{ deck: DeckMox; bruto: unknown }> {
  if (!ID.test(id)) throw new ErroDeck('Link de deck inválido');
  let bruto: RespostaMox;
  try {
    bruto = await rede.json<RespostaMox>(`${API}/v3/decks/all/${encodeURIComponent(id)}`);
  } catch (e) {
    if (!(e instanceof ErroRede) || e.tipo !== 'nao-encontrado') throw traduzir(e);
    try {
      bruto = await rede.json<RespostaMox>(`${API}/v2/decks/all/${encodeURIComponent(id)}`);
    } catch (e2) {
      if (e2 instanceof ErroRede && e2.tipo === 'nao-encontrado') throw new ErroDeck('Deck não encontrado no Moxfield (o link está certo? O deck é público ou não listado?)');
      throw traduzir(e2);
    }
  }
  if (!bruto || typeof bruto !== 'object') throw new ErroDeck('O Moxfield respondeu algo inesperado');
  return { deck: normalizar(bruto, id), bruto };
}

function traduzir(e: unknown): Error {
  if (e instanceof ErroRede) {
    if (e.tipo === 'bloqueado' || e.tipo === 'nao-json') return new ErroDeck('O Moxfield recusou o pedido agora. Tente mais tarde; se continuar, o anfitrião pode importar com o arquivo do deck (ferramentas/decks.ts importar --arquivo).');
    return new ErroDeck(`Não foi possível falar com o Moxfield: ${e.message}`);
  }
  return e instanceof Error ? e : new Error(String(e));
}
