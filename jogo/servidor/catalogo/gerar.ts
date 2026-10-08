// Gera jogo/gerado/ (o que o motor e o servidor leem) a partir de ../cartas (os 7 decks coletados, somente
// leitura) e de decks/ (listas importadas ou atualizadas pelo Moxfield e as cartas novas):
//   gerado/cartas.json   dados Oracle de toda carta que já esteve num deck (só cresce) e das fichas
//   gerado/decks.json    os decks jogáveis (a lista `atual` de cada um), na ordem fixa de `ordem`
//   gerado/imagens.json  imagem de cada carta e a impressão em português, quando houver
//
// Mantém exatamente a saída do antigo ferramentas/importar.ts para os 7 decks (mesma ordem e formatação):
// as fichas originais vêm primeiro e as novas vão para o fim, para nenhuma ficha trocar de imagem.

import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DeckList } from '../../motor/state.ts';
import type { DeckArquivo, NovasCartas, Printing, ScryCard, ScryFace } from './tipos.ts';

export interface DeckOriginal {
  id: string;
  name: string;
  source_url?: string | null;
  entries: { zone: string; quantity: number; card_id: string | null; printing_id: string | null; language_variants?: { en?: string | null; pt?: string | null } }[];
}

export interface Originais {
  cards: Record<string, ScryCard>;
  printings: Record<string, Printing>;
  /** decks de ../cartas/decks, na ordem das pastas */
  decks: DeckOriginal[];
}

/** formato de uma carta em gerado/cartas.json (o motor converte em motor/oracle.ts) */
export interface CartaGerada {
  name: string; oracleId: string; layout: string; manaValue: number; colorIdentity: string[]; keywords: string[];
  faces: FaceGerada[];
}
export interface FaceGerada {
  name: string; manaCost: string; typeLine: string; supertypes: string[]; types: string[]; subtypes: string[];
  oracleText: string; power: number | string | null; toughness: number | string | null; loyalty: number | string | null;
  colors: string[]; colorIndicator: string[] | null;
}
export interface ImagemGerada { id: string; frente: string | null; verso: string | null }
export interface PtGerada extends ImagemGerada {
  nome: string | null; tipo: string | null; texto: string | null;
  faces: { nome: string | null; tipo: string | null; texto: string | null }[] | null;
  reserva: boolean;
}
export type ImagensGeradas = Record<string, { en: ImagemGerada | null; pt: PtGerada | null }>;
export interface CartasGeradas { cartas: Record<string, CartaGerada>; fichas: (CartaGerada & { imagem: ImagemGerada | null })[] }

export interface Saida {
  cartas: CartasGeradas;
  decks: DeckList[];
  imagens: ImagensGeradas;
  avisos: string[];
}

export const novasVazias = (): NovasCartas => ({ formato: 1, cards: {}, printings: {}, escolhas: {}, fichas: [] });

// ---------------------------------------------------------------------------- leitura

export function lerOriginais(pastaCartas: string): Originais {
  const dados = join(pastaCartas, 'data');
  if (!existsSync(join(dados, 'cards.json'))) return { cards: {}, printings: {}, decks: [] };
  const cards = JSON.parse(readFileSync(join(dados, 'cards.json'), 'utf8')) as Record<string, ScryCard>;
  const printings = JSON.parse(readFileSync(join(dados, 'printings.json'), 'utf8')) as Record<string, Printing>;
  const pastaDecks = join(pastaCartas, 'decks');
  const decks = existsSync(pastaDecks)
    ? readdirSync(pastaDecks).sort().filter((p) => existsSync(join(pastaDecks, p, 'deck.json')))
      .map((p) => JSON.parse(readFileSync(join(pastaDecks, p, 'deck.json'), 'utf8')) as DeckOriginal)
    : [];
  return { cards, printings, decks };
}

export function lerNovas(pastaDecks: string): NovasCartas {
  const arq = join(pastaDecks, 'cartas.json');
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) as NovasCartas : novasVazias();
}

/** o gerado/ de antes (nada que já esteve no jogo se perde ao regerar) */
export interface Anterior { cartas: CartasGeradas | null; imagens: ImagensGeradas | null }

export function lerAnterior(pastaGerado: string): Anterior {
  const ler = <T>(nome: string): T | null => {
    const arq = join(pastaGerado, nome);
    try { return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) as T : null; } catch { return null; }
  };
  return { cartas: ler<CartasGeradas>('cartas.json'), imagens: ler<ImagensGeradas>('imagens.json') };
}

// ---------------------------------------------------------------------------- conversão

const SUPERTIPOS = new Set(['Basic', 'Legendary', 'Snow', 'World', 'Token']);
function tipos(typeLine: string) {
  const [esq, dir] = typeLine.split(' — ');
  const palavras = esq.trim().split(/\s+/).filter(Boolean);
  return {
    supertypes: palavras.filter((p) => SUPERTIPOS.has(p) && p !== 'Token'),
    types: palavras.filter((p) => !SUPERTIPOS.has(p)),
    subtypes: dir ? dir.trim().split(/\s+/) : [],
  };
}
function numero(v?: string | null): number | string | null {
  if (v === undefined || v === null) return null;
  return /^-?\d+$/.test(v) ? Number(v) : v; // '*' e 'X' ficam como texto
}
function face(f: ScryFace): FaceGerada {
  return {
    name: f.name,
    manaCost: f.mana_cost ?? '',
    typeLine: f.type_line ?? '',
    ...tipos(f.type_line ?? ''),
    oracleText: f.oracle_text ?? '',
    power: numero(f.power), toughness: numero(f.toughness), loyalty: numero(f.loyalty),
    colors: f.colors ?? [], colorIndicator: f.color_indicator ?? null,
  };
}

/** a carta no formato de gerado/cartas.json */
export function cartaGerada(c: ScryCard): CartaGerada {
  return {
    name: c.name, oracleId: c.oracle_id, layout: c.layout, manaValue: c.cmc,
    colorIdentity: c.color_identity, keywords: c.keywords, faces: (c.card_faces ?? [c]).map(face),
  };
}

function imagemDe(p: Printing | undefined): ImagemGerada | null {
  if (!p) return null;
  const frente = p.local_images?.find((i) => i.face === 'front')?.path ?? null;
  const verso = p.local_images?.find((i) => i.face === 'back')?.path ?? null;
  return { id: p.id, frente, verso };
}
function portugues(p: Printing | undefined): PtGerada | null {
  if (!p || p.lang !== 'pt') return null;
  const img = imagemDe(p)!;
  const faces = p.card_faces?.map((f) => ({ nome: f.printed_name ?? null, tipo: f.printed_type_line ?? null, texto: f.printed_text ?? null }));
  // imagem de reserva do Scryfall ("Localized Image Not Available"): fica o nome, a imagem é a inglesa
  const reserva = p.image_status === 'placeholder';
  return { ...img, nome: p.printed_name ?? faces?.[0]?.nome ?? null, tipo: p.printed_type_line ?? faces?.[0]?.tipo ?? null, texto: p.printed_text ?? null, faces: faces ?? null, reserva };
}

/** nomes de uma lista, com o comandante */
export const nomesDaLista = (l: { comandante: string; cartas: { nome: string }[] }) => [...new Set([l.comandante, ...l.cartas.map((c) => c.nome)])];

// ---------------------------------------------------------------------------- junção

export function gerar(o: { originais: Originais; novas: NovasCartas; decks: DeckArquivo[]; anterior: Anterior | null }): Saida {
  const { originais, novas } = o;
  const avisos: string[] = [];
  const impressao = (id: string | null | undefined) => (id ? originais.printings[id] ?? novas.printings[id] : undefined);

  // decks coletados em ../cartas: definem as imagens (a primeira impressão vista de cada carta) e a divisão
  // entre cartas e fichas dos dados originais
  const imagens: ImagensGeradas = {};
  const nomesOriginais = new Set<string>();
  for (const d of originais.decks) {
    for (const e of d.entries) {
      const c = e.card_id ? originais.cards[e.card_id] : undefined;
      if (!c) { avisos.push(`${d.name}: carta sem dados em ../cartas (${e.card_id})`); continue; }
      nomesOriginais.add(c.name);
      if (!imagens[c.name]) imagens[c.name] = { en: imagemDe(impressao(e.printing_id)), pt: portugues(impressao(e.language_variants?.pt)) };
    }
  }
  // cartas novas: a impressão escolhida na importação
  for (const [nome, esc] of Object.entries(novas.escolhas)) {
    if (!imagens[nome]) imagens[nome] = { en: imagemDe(impressao(esc.en)), pt: portugues(impressao(esc.pt)) };
  }

  const ordenados = [...o.decks].sort((a, b) => a.ordem - b.ordem || a.id.localeCompare(b.id));
  const fichasNovas = new Set(novas.fichas);
  const nomes = new Set(nomesOriginais);
  for (const d of ordenados) for (const l of [d.atual, d.preparacao]) if (l) for (const n of nomesDaLista(l)) nomes.add(n);
  for (const c of Object.values(novas.cards)) if (!fichasNovas.has(c.oracle_id)) nomes.add(c.name);

  const cartas: Record<string, CartaGerada> = {};
  const fichas: CartasGeradas['fichas'] = [];
  for (const c of Object.values(originais.cards)) {
    const dado = cartaGerada(c);
    if (nomesOriginais.has(c.name)) cartas[c.name] = dado;
    else {
      fichas.push({ ...dado, imagem: imagemDe(originais.printings[c.printing_ids[0]]) });
      if (nomes.has(c.name)) cartas[c.name] = dado;
    }
  }
  // sem ../cartas (outra máquina), as fichas originais vêm do gerado/ anterior
  if (!Object.keys(originais.cards).length) fichas.push(...(o.anterior?.cartas?.fichas ?? []).filter((f) => !fichasNovas.has(f.oracleId)));
  for (const c of Object.values(novas.cards)) if (!fichasNovas.has(c.oracle_id) && !cartas[c.name]) cartas[c.name] = cartaGerada(c);
  for (const oid of novas.fichas) {
    const c = novas.cards[oid];
    if (c) fichas.push({ ...cartaGerada(c), imagem: imagemDe(novas.printings[c.printing_ids[0]]) });
  }
  // nome que já esteve no jogo e sumiu das fontes: continua (partidas salvas podem ter a carta)
  for (const [nome, c] of Object.entries(o.anterior?.cartas?.cartas ?? {})) {
    if (!cartas[nome]) { cartas[nome] = c; avisos.push(`${nome}: mantida de gerado/cartas.json (não está mais nas fontes)`); }
  }
  for (const nome of Object.keys(cartas)) if (!imagens[nome] && o.anterior?.imagens?.[nome]) imagens[nome] = o.anterior.imagens[nome];
  for (const n of nomes) if (!cartas[n]) avisos.push(`${n}: sem dados Oracle`);

  const decks: DeckList[] = [];
  for (const d of ordenados) {
    if (!d.atual) continue;
    const falta = nomesDaLista(d.atual).filter((n) => !cartas[n]);
    if (falta.length) { avisos.push(`${d.nome}: fora da lista de decks, sem dados de ${falta.join(', ')}`); continue; }
    decks.push({ id: d.id, nome: d.nome, comandante: d.atual.comandante, cartas: d.atual.cartas.map((c) => ({ nome: c.nome, quantidade: c.quantidade })) });
  }

  const ordenado = Object.fromEntries(Object.entries(cartas).sort(([a], [b]) => a.localeCompare(b)));
  return { cartas: { cartas: ordenado, fichas }, decks, imagens, avisos };
}

function escrever(arq: string, dado: unknown): void {
  writeFileSync(arq + '.novo', JSON.stringify(dado, null, 1) + '\n');
  renameSync(arq + '.novo', arq);
}

export function escreverGerado(pasta: string, s: Saida): void {
  mkdirSync(pasta, { recursive: true });
  escrever(join(pasta, 'cartas.json'), s.cartas);
  escrever(join(pasta, 'decks.json'), s.decks);
  escrever(join(pasta, 'imagens.json'), s.imagens);
}

/** lê todas as fontes e regrava gerado/ */
export function regenerar(pastas: { cartasOriginais: string; decks: string; gerado: string }, decks: DeckArquivo[]): Saida {
  const saida = gerar({ originais: lerOriginais(pastas.cartasOriginais), novas: lerNovas(pastas.decks), decks, anterior: lerAnterior(pastas.gerado) });
  escreverGerado(pastas.gerado, saida);
  return saida;
}
