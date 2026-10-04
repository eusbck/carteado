// Importa os dados de ../cartas (somente leitura) para jogo/gerado/:
//   gerado/cartas.json   dados Oracle das cartas dos decks e das fichas (o motor usa)
//   gerado/decks.json    os 7 decks: comandante e lista
//   gerado/imagens.json  caminho das imagens e impressão em português, quando houver
// Uso: node ferramentas/importar.ts

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, '..', 'cartas');
const destino = join(raiz, 'gerado');
mkdirSync(destino, { recursive: true });

interface ScryFace {
  name: string; mana_cost?: string; type_line?: string; oracle_text?: string;
  power?: string; toughness?: string; loyalty?: string; colors?: string[]; color_indicator?: string[];
}
interface ScryCard extends ScryFace {
  id: string; oracle_id: string; layout: string; cmc: number; color_identity: string[];
  keywords: string[]; card_faces: ScryFace[] | null; printing_ids: string[];
}
interface Printing {
  id: string; lang: string; name: string; printed_name?: string | null; printed_type_line?: string | null;
  printed_text?: string | null; local_images?: { face: string; path: string }[];
  card_faces?: { printed_name?: string; printed_type_line?: string; printed_text?: string }[] | null;
  oracle_id: string; type_line?: string; power?: string; toughness?: string; colors?: string[]; oracle_text?: string;
}

const cards: Record<string, ScryCard> = JSON.parse(readFileSync(join(fonte, 'data', 'cards.json'), 'utf8'));
const printings: Record<string, Printing> = JSON.parse(readFileSync(join(fonte, 'data', 'printings.json'), 'utf8'));

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
function face(f: ScryFace) {
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

// Decks
const decks: unknown[] = [];
const nomesDosDecks = new Set<string>();
const imagens: Record<string, unknown> = {};
function imagemDe(printingId: string | null | undefined) {
  if (!printingId) return null;
  const p = printings[printingId];
  if (!p) return null;
  const frente = p.local_images?.find((i) => i.face === 'front')?.path ?? null;
  const verso = p.local_images?.find((i) => i.face === 'back')?.path ?? null;
  return { id: p.id, frente, verso };
}
function portugues(printingId: string | null | undefined) {
  if (!printingId) return null;
  const p = printings[printingId];
  if (!p || p.lang !== 'pt') return null;
  const img = imagemDe(printingId);
  const faces = p.card_faces?.map((f) => ({ nome: f.printed_name ?? null, tipo: f.printed_type_line ?? null, texto: f.printed_text ?? null }));
  return { ...img, nome: p.printed_name ?? faces?.[0]?.nome ?? null, tipo: p.printed_type_line ?? faces?.[0]?.tipo ?? null, texto: p.printed_text ?? null, faces: faces ?? null };
}

for (const pasta of readdirSync(join(fonte, 'decks')).sort()) {
  const d = JSON.parse(readFileSync(join(fonte, 'decks', pasta, 'deck.json'), 'utf8'));
  const lista: { nome: string; quantidade: number }[] = [];
  let comandante = '';
  for (const e of d.entries) {
    const c = cards[e.card_id];
    nomesDosDecks.add(c.name);
    if (e.zone === 'commanders') comandante = c.name;
    else lista.push({ nome: c.name, quantidade: e.quantity });
    if (!imagens[c.name]) {
      imagens[c.name] = { en: imagemDe(e.printing_id), pt: portugues(e.language_variants?.pt) };
    }
  }
  decks.push({ id: d.id, nome: d.name, comandante, cartas: lista });
}

// Cartas (Oracle). Fichas e objetos auxiliares ficam numa lista à parte, porque há nomes repetidos.
const cartas: Record<string, unknown> = {};
const fichas: unknown[] = [];
for (const c of Object.values(cards)) {
  const faces = (c.card_faces ?? [c]).map(face);
  const dado = {
    name: c.name, oracleId: c.oracle_id, layout: c.layout, manaValue: c.cmc,
    colorIdentity: c.color_identity, keywords: c.keywords, faces,
  };
  if (nomesDosDecks.has(c.name)) cartas[c.name] = dado;
  else {
    const p = printings[c.printing_ids[0]];
    fichas.push({ ...dado, imagem: imagemDe(p?.id) });
  }
}

const ordenado = Object.fromEntries(Object.entries(cartas).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(destino, 'cartas.json'), JSON.stringify({ cartas: ordenado, fichas }, null, 1) + '\n');
writeFileSync(join(destino, 'decks.json'), JSON.stringify(decks, null, 1) + '\n');
writeFileSync(join(destino, 'imagens.json'), JSON.stringify(imagens, null, 1) + '\n');
console.log(`cartas: ${Object.keys(cartas).length}, fichas/auxiliares: ${fichas.length}, decks: ${decks.length}`);
