import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { registry } from '../motor/defs.ts';
import { slug } from './slug.ts';

export function arquivosDeTeste(pasta: string): Set<string> {
  const arquivos = new Set<string>();
  for (const f of readdirSync(pasta).filter((x) => x.endsWith('.test.ts'))) {
    const texto = readFileSync(join(pasta, f), 'utf8');
    if (!/\bit(?:\.each\([^\n]*\))?\(/.test(texto)) continue;
    arquivos.add(f.replace(/\.test\.ts$/, ''));
    for (const m of texto.matchAll(/^\/\/ cobre: (.+)$/gm)) for (const n of m[1].split(',')) arquivos.add(slug(n.trim()));
  }
  return arquivos;
}

export function coberturaCarta(nome: string, rulingsTotal: number, testes: Set<string>) {
  const def = registry.cards.get(nome);
  const impl = !!def && !def.pending;
  const rulingsOk = Object.entries(def?.rulings ?? {}).filter(([k, v]) =>
    Number.isInteger(Number(k)) && Number(k) >= 1 && Number(k) <= rulingsTotal && v.trim().length > 0,
  ).length;
  return { impl, teste: impl && testes.has(slug(nome)), rulingsOk, rulingsTotal };
}
