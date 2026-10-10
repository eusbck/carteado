// Gera COBERTURA.md para as cartas originais E as importadas, fichas e recursos de regra.
// A união usa oracle_id: fichas com o mesmo nome e características diferentes continuam distintas.
// Uso: node ferramentas/cobertura.ts

import '../cartas/index.ts';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry } from '../motor/defs.ts';
import { RECURSOS_DE_REGRA } from '../cartas/recursos.ts';
import { rulingsPorOracle } from '../servidor/catalogo/base.ts';
import { Catalogo } from '../servidor/catalogo/catalogo.ts';
import { lerNovas, nomesDaLista } from '../servidor/catalogo/gerar.ts';
import { cartaPronta } from '../servidor/catalogo/prontidao.ts';
import { coberturaCarta, arquivosDeTeste } from './cobertura-dados.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, '..', 'cartas');
const originais = JSON.parse(readFileSync(join(fonte, 'data', 'cards.json'), 'utf8')) as Record<string, { name: string; oracle_id: string; layout: string }>;
const novas = lerNovas(join(raiz, 'decks'));
const cards = new Map([...Object.values(originais), ...Object.values(novas.cards)].map((c) => [c.oracle_id, c]));
const rulings = rulingsPorOracle();
const decksPorNome = new Map<string, string[]>();
const catalogo = new Catalogo({ pasta: join(raiz, 'decks'), pronta: cartaPronta });
for (const d of catalogo.todos()) {
  const nomes = new Set([...(d.atual ? nomesDaLista(d.atual) : []), ...(d.preparacao ? nomesDaLista(d.preparacao) : [])]);
  for (const nome of nomes) decksPorNome.set(nome, [...(decksPorNome.get(nome) ?? []), d.nome]);
}
const lev = JSON.parse(readFileSync(join(raiz, 'levantamento', 'cartas.json'), 'utf8')) as { nome: string; decks: string[]; ficha_ou_auxiliar: boolean; camada: string; parte: string | null }[];
const byName = new Map(lev.map((l) => [l.nome, l]));

// testes: cartas/defs/<slug>.test.ts com pelo menos um it(), e testes de fichas
const defsDir = join(raiz, 'cartas', 'defs');
const testFiles = arquivosDeTeste(defsDir);
const fichasTeste = existsSync(join(raiz, 'cartas', 'fichas.test.ts')) ? readFileSync(join(raiz, 'cartas', 'fichas.test.ts'), 'utf8') : '';

interface Row { nome: string; decks: string; tipo: 'carta' | 'ficha'; impl: boolean; teste: boolean; rulingsOk: number; rulingsTotal: number; parte: string }
const rows: Row[] = [];
for (const c of cards.values()) {
  const l = byName.get(c.name);
  const total = (rulings[c.oracle_id] ?? []).length;
  if (decksPorNome.has(c.name) || (l && !l.ficha_ou_auxiliar)) {
    const { impl, teste, rulingsOk } = coberturaCarta(c.name, total, testFiles);
    rows.push({ nome: c.name, decks: (decksPorNome.get(c.name) ?? l?.decks ?? []).join(', '), tipo: 'carta', impl, teste, rulingsOk, rulingsTotal: total, parte: l?.parte ?? (l?.camada === 'dados' ? 'dados' : 'importada') });
  } else {
    // ficha ou objeto auxiliar: implementada se há definição de ficha com essa imagem, ou recurso de regra
    const token = [...registry.tokens.values()].find((t) => t.image === c.oracle_id);
    const recurso = RECURSOS_DE_REGRA[c.name];
    const impl = !!token || !!recurso?.implementado;
    const teste = token ? fichasTeste.includes(`'${token.id}'`) : !!recurso?.teste;
    rows.push({ nome: token ? `${c.name} (${token.id})` : c.name, decks: '—', tipo: 'ficha', impl, teste: impl && teste, rulingsOk: impl && teste ? total : 0, rulingsTotal: total, parte: 'ficha' });
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
// --deck permite usar esta auditoria como barreira de entrega, sem promover o deck.
const i = process.argv.indexOf('--deck');
if (i >= 0) {
  const d = catalogo.ler(process.argv[i + 1]);
  if (!d || !(d.preparacao ?? d.atual)) throw new Error('Deck não encontrado');
  const nomes = new Set(nomesDaLista((d.preparacao ?? d.atual)!));
  const falhas = rows.filter((r) => r.tipo === 'carta' && nomes.has(r.nome) && !(r.impl && r.teste && r.rulingsOk === r.rulingsTotal));
  for (const f of falhas) console.error(`${f.nome}: implementação ${f.impl}, teste ${f.teste}, rulings ${f.rulingsOk}/${f.rulingsTotal}`);
  console.log(`${d.nome}: ${nomes.size - falhas.length}/${nomes.size} cartas auditadas`);
  if (falhas.length) process.exitCode = 1;
}
