// Leitura e gravação dos dados das cartas novas (decks/cartas.json e decks/rulings.json) e a visão junta com
// ../cartas que as ferramentas de implementar cartas usam (rulings e oracle id pelo nome).

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pastasPadrao, type Pastas } from './caminhos.ts';
import { lerNovas } from './gerar.ts';
import type { NovosRulings, Ruling, ScryCard } from './tipos.ts';

/** grava num arquivo temporário e troca (quem lê nunca vê o arquivo pela metade) */
export function gravarJson(arq: string, dado: unknown): void {
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(arq + '.novo', JSON.stringify(dado, null, 1) + '\n');
  renameSync(arq + '.novo', arq);
}

export function lerRulingsNovos(pastaDecks: string): NovosRulings {
  const arq = join(pastaDecks, 'rulings.json');
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) as NovosRulings : { formato: 1, by_oracle_id: {} };
}

/** rulings de todas as cartas (../cartas e as novas), por oracle id */
export function rulingsPorOracle(p: Pastas = pastasPadrao()): Record<string, Ruling[]> {
  const arq = join(p.cartasOriginais, 'data', 'rulings.json');
  const originais = existsSync(arq) ? (JSON.parse(readFileSync(arq, 'utf8')) as { by_oracle_id: Record<string, Ruling[]> }).by_oracle_id : {};
  return { ...originais, ...lerRulingsNovos(p.decks).by_oracle_id };
}

/** identidade de cada carta pelo nome (../cartas e as novas) */
export function cartasPorNome(p: Pastas = pastasPadrao()): Map<string, ScryCard> {
  const arq = join(p.cartasOriginais, 'data', 'cards.json');
  const originais = existsSync(arq) ? Object.values(JSON.parse(readFileSync(arq, 'utf8')) as Record<string, ScryCard>) : [];
  const m = new Map<string, ScryCard>();
  for (const c of [...originais, ...Object.values(lerNovas(p.decks).cards)]) if (!m.has(c.name)) m.set(c.name, c);
  return m;
}
