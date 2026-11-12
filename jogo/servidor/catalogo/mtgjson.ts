// Listas oficiais dos precons de Commander, do MTGJSON (mtgjson.com/api/v5, dados abertos). Usadas só por
// `decks.ts classificar` (ver origem.ts). O índice dos decks é baixado de novo depois de uma semana (saem precons
// novos); a lista de cada precon não muda e fica guardada em .cache/mtgjson/ para sempre.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PreconOficial } from './origem.ts';
import type { Rede } from './rede.ts';

const BASE = 'https://mtgjson.com/api/v5';
const SEMANA = 7 * 24 * 3600 * 1000;

interface IndiceMtgjson { data: { code: string; fileName: string; name: string; type: string; releaseDate: string }[] }
interface CartaMtgjson { name: string; count: number }
interface DeckMtgjson { data: { name: string; code: string; commander?: CartaMtgjson[]; displayCommander?: CartaMtgjson[]; mainBoard?: CartaMtgjson[] } }

/** os precons de Commander (sem as edições de colecionador, que repetem a lista com outras artes) */
export async function preconsOficiais(rede: Rede, pastaCache: string, aviso: (m: string) => void = () => {}): Promise<PreconOficial[]> {
  mkdirSync(join(pastaCache, 'decks'), { recursive: true });
  const arqIndice = join(pastaCache, 'DeckList.json');
  let indice: IndiceMtgjson;
  if (existsSync(arqIndice) && Date.now() - statSync(arqIndice).mtimeMs < SEMANA) {
    indice = JSON.parse(readFileSync(arqIndice, 'utf8')) as IndiceMtgjson;
  } else {
    indice = await rede.json<IndiceMtgjson>(`${BASE}/DeckList.json`);
    writeFileSync(arqIndice, JSON.stringify(indice));
  }
  const escolhidos = indice.data.filter((d) => /commander/i.test(d.type) && !/collector/i.test(d.name));
  const faltam = escolhidos.filter((d) => !existsSync(join(pastaCache, 'decks', `${d.fileName}.json`)));
  if (faltam.length) aviso(`Baixando ${faltam.length} lista(s) de precon do MTGJSON…`);
  const out: PreconOficial[] = [];
  for (const d of escolhidos) {
    const arq = join(pastaCache, 'decks', `${d.fileName}.json`);
    if (!existsSync(arq)) {
      try {
        const j = await rede.json<DeckMtgjson>(`${BASE}/decks/${encodeURIComponent(d.fileName)}.json`);
        const cartas: Record<string, number> = {};
        for (const zona of [j.data.commander, j.data.displayCommander, j.data.mainBoard]) {
          for (const c of zona ?? []) cartas[c.name] = (cartas[c.name] ?? 0) + c.count;
        }
        writeFileSync(arq, JSON.stringify({ nome: d.name, codigo: d.code, cartas } satisfies PreconOficial));
      } catch (e) {
        aviso(`${d.name}: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
    }
    out.push(JSON.parse(readFileSync(arq, 'utf8')) as PreconOficial);
  }
  return out;
}
