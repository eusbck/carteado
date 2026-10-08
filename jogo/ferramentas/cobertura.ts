// Gera COBERTURA.md: para cada uma das 547 entradas de cartas/data/cards.json, se está
// implementada, se tem teste próprio e quantos rulings foram conferidos.
// Uso: node ferramentas/cobertura.ts

import '../cartas/index.ts';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry } from '../motor/defs.ts';
import { slug } from './slug.ts';
import { RECURSOS_DE_REGRA } from '../cartas/recursos.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, '..', 'cartas');
const cards = JSON.parse(readFileSync(join(fonte, 'data', 'cards.json'), 'utf8')) as Record<string, { name: string; oracle_id: string; layout: string }>;
const rulings = JSON.parse(readFileSync(join(fonte, 'data', 'rulings.json'), 'utf8')).by_oracle_id as Record<string, unknown[]>;
const lev = JSON.parse(readFileSync(join(raiz, 'levantamento', 'cartas.json'), 'utf8')) as { nome: string; decks: string[]; ficha_ou_auxiliar: boolean; camada: string; parte: string | null }[];
const byName = new Map(lev.map((l) => [l.nome, l]));

// testes: cartas/defs/<slug>.test.ts com pelo menos um it(), e testes de fichas
const defsDir = join(raiz, 'cartas', 'defs');
const testFiles = new Set<string>();
for (const f of readdirSync(defsDir).filter((x) => x.endsWith('.test.ts'))) {
  const txt = readFileSync(join(defsDir, f), 'utf8');
  if (!/\bit\(/.test(txt)) continue;
  testFiles.add(f.replace(/\.test\.ts$/, ''));
  // um arquivo pode declarar que cobre outras cartas: "// cobre: Plains, Island"
  for (const m of txt.matchAll(/^\/\/ cobre: (.+)$/gm)) for (const n of m[1].split(',')) testFiles.add(slug(n.trim()));
}
const fichasTeste = existsSync(join(raiz, 'cartas', 'fichas.test.ts')) ? readFileSync(join(raiz, 'cartas', 'fichas.test.ts'), 'utf8') : '';

interface Row { nome: string; decks: string; tipo: 'carta' | 'ficha'; impl: boolean; teste: boolean; rulingsOk: number; rulingsTotal: number; parte: string }
const rows: Row[] = [];
for (const c of Object.values(cards)) {
  const l = byName.get(c.name);
  const total = (rulings[c.oracle_id] ?? []).length;
  if (l && !l.ficha_ou_auxiliar) {
    const def = registry.cards.get(c.name);
    const impl = !!def && !def.pending;
    const ok = def?.rulings ? Object.keys(def.rulings).filter((k) => Number(k) >= 1 && Number(k) <= total).length : 0;
    rows.push({ nome: c.name, decks: l.decks.join(', '), tipo: 'carta', impl, teste: impl && testFiles.has(slug(c.name)), rulingsOk: ok, rulingsTotal: total, parte: l.parte ?? (l.camada === 'dados' ? 'dados' : '?') });
  } else {
    // ficha ou objeto auxiliar: implementada se há definição de ficha com essa imagem, ou recurso de regra
    const token = [...registry.tokens.values()].find((t) => t.image === c.oracle_id);
    const recurso = RECURSOS_DE_REGRA[c.name];
    const impl = !!token || !!recurso?.implementado;
    const teste = token ? fichasTeste.includes(`'${token.id}'`) : !!recurso?.teste;
    rows.push({ nome: token ? `${c.name} (${token.id})` : c.name, decks: '—', tipo: 'ficha', impl, teste: impl && teste, rulingsOk: total, rulingsTotal: total, parte: 'ficha' });
  }
}
rows.sort((a, b) => (a.tipo === b.tipo ? a.nome.localeCompare(b.nome) : a.tipo === 'carta' ? -1 : 1));

const done = rows.filter((r) => r.impl && r.teste && r.rulingsOk === r.rulingsTotal).length;
const impl = rows.filter((r) => r.impl).length;
const tested = rows.filter((r) => r.teste).length;
const rTotal = rows.filter((r) => r.tipo === 'carta').reduce((n, r) => n + r.rulingsTotal, 0);
const rOk = rows.filter((r) => r.tipo === 'carta').reduce((n, r) => n + r.rulingsOk, 0);
const pend = rows.filter((r) => !(r.impl && r.teste && r.rulingsOk === r.rulingsTotal));

const md = `# Cobertura das cartas

Gerado por \`ferramentas/cobertura.ts\`. Não edite à mão.

| | |
| --- | ---: |
| Entradas (cartas dos decks + fichas e objetos auxiliares) | ${rows.length} |
| **Implementadas, testadas e com rulings conferidos** | **${done} / ${rows.length}** |
| Implementadas | ${impl} |
| Com teste próprio | ${tested} |
| Rulings conferidos (cartas dos decks) | ${rOk} / ${rTotal} |
| Pendentes (jogáveis em modo manual) | ${pend.length} |

Uma carta conta como pronta quando tem definição em \`cartas/defs/\`, um arquivo de teste próprio
(\`cartas/defs/<nome>.test.ts\`) e cada ruling registrado na definição com o teste que o cobre ou o
motivo de não se aplicar.

## Situação por carta

| Carta | Decks | Parte | Implementada | Teste | Rulings |
| --- | --- | --- | :---: | :---: | ---: |
${rows.map((r) => `| ${r.nome} | ${r.decks} | ${r.parte} | ${r.impl ? 'sim' : '—'} | ${r.teste ? 'sim' : '—'} | ${r.rulingsTotal ? `${r.rulingsOk}/${r.rulingsTotal}` : '—'} |`).join('\n')}
`;
writeFileSync(join(raiz, 'COBERTURA.md'), md);
console.log(`prontas ${done}/${rows.length}; implementadas ${impl}; testadas ${tested}; rulings ${rOk}/${rTotal}`);
