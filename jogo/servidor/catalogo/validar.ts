// Regras de deck do modo da lista (Commander, CR 903.3 e 903.5; Standard, CR 100.2a e MTR 3.3) na lista vinda do
// Moxfield, antes de qualquer coisa ser gravada. As cartas que ainda não estão em gerado/ são conferidas pelos dados do
// Scryfall.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateDeck } from '../../motor/deck.ts';
import { modoDe } from '../../motor/modos.ts';
import type { OracleCard } from '../../motor/oracle.ts';
import type { Lista } from './tipos.ts';

/** cartas banidas no Commander (../dados/banidas-commander.json), se o arquivo existir */
export function lerBanidas(pastaDados: string): Set<string> {
  const arq = join(pastaDados, 'banidas-commander.json');
  if (!existsSync(arq)) return new Set();
  try { return new Set((JSON.parse(readFileSync(arq, 'utf8')) as { banned_by_name?: string[] }).banned_by_name ?? []); } catch { return new Set(); }
}

export function validarLista(
  lista: Lista,
  buscar: (nome: string) => OracleCard,
  o: { banidas?: Set<string>; legalidade?: (nome: string) => string | null } = {},
): { erros: string[]; avisos: string[] } {
  const modo = modoDe(lista);
  const deck = { id: '', nome: '', formato: modo, comandante: lista.comandante, parceiro: lista.parceiro, cartas: lista.cartas };
  // no Standard a legalidade é regra do deck (MTR 3.3): carta fora do formato impede confirmar
  const legal = modo === 'standard' && o.legalidade ? (n: string) => o.legalidade!(n) ?? undefined : undefined;
  const erros = validateDeck(deck, buscar, legal).map((p) => `${p.message} — ${p.rule.startsWith('MTR') ? p.rule : `CR ${p.rule}`}`);
  const avisos: string[] = [];
  if (modo !== 'commander') return { erros, avisos };
  for (const nome of new Set([...(lista.comandante ? [lista.comandante] : []), ...(lista.parceiro ? [lista.parceiro] : []), ...lista.cartas.map((c) => c.nome)])) {
    const leg = o.legalidade?.(nome) ?? null;
    if (o.banidas?.has(nome) || leg === 'banned') avisos.push(`${nome} está banida no Commander`);
    else if (leg === 'not_legal') avisos.push(`${nome} não é legal no Commander`);
  }
  return { erros, avisos };
}
