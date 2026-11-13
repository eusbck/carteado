// De onde cada deck vem: um precon (deck pré-montado à venda, igual ao produto), um precon com cartas trocadas, uma
// lista montada por alguém (um link do Moxfield qualquer) ou um deck criado aqui (cartas inventadas, sem link).
//
// A comparação é com as listas oficiais dos precons de Commander do MTGJSON (mtgjson.com, dados abertos), feita
// por `node ferramentas/decks.ts classificar` e guardada em decks/origens.json. Um deck que ainda não passou pela
// comparação usa um palpite (sem link: criado aqui; "Precon" no nome: precon; o resto: montado).

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DeckArquivo, Lista } from './tipos.ts';

export type TipoOrigem = 'precon' | 'modificado' | 'montado' | 'casa';

export interface OrigemDeck {
  tipo: TipoOrigem;
  /** o precon oficial mais parecido (precon e modificado), ex.: "Abzan Armor" */
  produto?: string;
  /** código da coleção no MTGJSON, ex.: "TDC" */
  codigo?: string;
  /** cartas do precon que saíram (modificado) */
  trocas?: number;
  /** quando a comparação foi feita; ausente no palpite */
  conferidoEm?: string;
}

export interface OrigensArquivo { formato: 1; decks: Record<string, OrigemDeck> }

/** a partir de quantas cartas em comum (de 100) uma lista conta como o precon com trocas */
export const MINIMO_MODIFICADO = 75;

export const ROTULO_ORIGEM: Record<TipoOrigem, string> = {
  precon: 'Precon',
  modificado: 'Precon modificado',
  montado: 'Montado',
  casa: 'Criado aqui',
};

const arquivo = (pastaDecks: string) => join(pastaDecks, 'origens.json');

export function lerOrigens(pastaDecks: string): OrigensArquivo {
  try {
    const a = arquivo(pastaDecks);
    if (existsSync(a)) {
      const o = JSON.parse(readFileSync(a, 'utf8')) as OrigensArquivo;
      if (o.formato === 1 && o.decks) return o;
    }
  } catch (e) {
    console.error('decks/origens.json:', e);
  }
  return { formato: 1, decks: {} };
}

export function gravarOrigens(pastaDecks: string, o: OrigensArquivo): void {
  const a = arquivo(pastaDecks);
  const ordenado: OrigensArquivo = { formato: 1, decks: Object.fromEntries(Object.entries(o.decks).sort(([x], [y]) => x.localeCompare(y))) };
  writeFileSync(a + '.novo', JSON.stringify(ordenado, null, 1) + '\n');
  renameSync(a + '.novo', a);
}

/** palpite para um deck que ainda não foi comparado com os precons */
export function palpite(d: Pick<DeckArquivo, 'link' | 'nome' | 'criado'>): OrigemDeck {
  // feito na tela Montar deck (servidor/catalogo/montar.ts): cartas reais, montado de propósito
  if (d.criado) return { tipo: 'montado' };
  if (!d.link) return { tipo: 'casa' };
  if (/\bprecon\b/i.test(d.nome)) return { tipo: 'precon' };
  return { tipo: 'montado' };
}

/** a origem de um deck: a comparação gravada ou o palpite */
export function origemDe(origens: OrigensArquivo, d: Pick<DeckArquivo, 'id' | 'link' | 'nome' | 'criado'>): OrigemDeck {
  return origens.decks[d.id] ?? palpite(d);
}

// ---------------------------------------------------------------------------- comparação

/** um precon oficial: nome do produto, coleção e as cartas (comandante incluído) com a quantidade */
export interface PreconOficial { nome: string; codigo: string; cartas: Record<string, number> }

/** nome para comparar: só a primeira face, sem acento, caixa ou pontuação */
export const chaveCarta = (n: string) => n.split(' // ')[0].normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');

function contar(cartas: Record<string, number> | { nome: string; quantidade: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  const pares = Array.isArray(cartas) ? cartas.map((c) => [c.nome, c.quantidade] as const) : Object.entries(cartas);
  for (const [n, q] of pares) m.set(chaveCarta(n), (m.get(chaveCarta(n)) ?? 0) + q);
  return m;
}

/** cartas da lista (com o comandante e o parceiro) */
export function cartasDaLista(l: Lista): { nome: string; quantidade: number }[] {
  const out = [...l.cartas];
  for (const c of [l.comandante, l.parceiro]) if (c && !out.some((e) => e.nome === c)) out.push({ nome: c, quantidade: 1 });
  return out;
}

/** compara a lista com os precons oficiais e diz de onde ela vem */
export function classificar(d: Pick<DeckArquivo, 'link' | 'nome' | 'criado'>, lista: Lista, precons: PreconOficial[], agora = new Date()): OrigemDeck {
  // um deck da tela Montar deck também é comparado: alguém pode ter montado um precon nele
  if (!d.link && !d.criado) return { tipo: 'casa', conferidoEm: agora.toISOString() };
  const minha = contar(cartasDaLista(lista));
  const total = [...minha.values()].reduce((s, q) => s + q, 0);
  let melhor: { p: PreconOficial; iguais: number } | null = null;
  for (const p of precons) {
    const dele = contar(p.cartas);
    let iguais = 0;
    for (const [n, q] of minha) iguais += Math.min(q, dele.get(n) ?? 0);
    if (!melhor || iguais > melhor.iguais) melhor = { p, iguais };
  }
  const conferidoEm = agora.toISOString();
  if (!melhor) return { tipo: 'montado', conferidoEm };
  // cartas da lista que não estão no precon (a lista oficial às vezes repete o comandante como carta de exibição)
  const trocas = total - melhor.iguais;
  const produto = { produto: melhor.p.nome, codigo: melhor.p.codigo };
  if (trocas === 0) return { tipo: 'precon', ...produto, conferidoEm };
  if (melhor.iguais >= MINIMO_MODIFICADO) return { tipo: 'modificado', ...produto, trocas, conferidoEm };
  return { tipo: 'montado', conferidoEm };
}
