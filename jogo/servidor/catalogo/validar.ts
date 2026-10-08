// Regras de deck de Commander (CR 903.3 e 903.5) na lista vinda do Moxfield, antes de qualquer coisa ser gravada.
// As cartas que ainda não estão em gerado/ são conferidas pelos dados do Scryfall.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateDeck } from '../../motor/deck.ts';
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
  const erros = validateDeck({ id: '', nome: '', comandante: lista.comandante, cartas: lista.cartas }, buscar).map((p) => `${p.message} — CR ${p.rule}`);
  const avisos: string[] = [];
  for (const nome of new Set([lista.comandante, ...lista.cartas.map((c) => c.nome)])) {
    const leg = o.legalidade?.(nome) ?? null;
    if (o.banidas?.has(nome) || leg === 'banned') avisos.push(`${nome} está banida no Commander`);
    else if (leg === 'not_legal') avisos.push(`${nome} não é legal no Commander`);
  }
  return { erros, avisos };
}
