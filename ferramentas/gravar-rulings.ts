// Grava o campo `rulings` nas definições de cartas a partir de um JSON
// { "Nome da Carta": { "1": "teste: …", "2": "não se aplica: …" } }.
// Uso: node ferramentas/gravar-rulings.ts arquivo.json

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug } from './slug.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const entrada = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Record<string, Record<string, string>>;

function render(r: Record<string, string>): string {
  const linhas = Object.entries(r).sort(([a], [b]) => Number(a) - Number(b)).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`);
  return linhas.length ? `  rulings: {\n${linhas.join('\n')}\n  },` : '  rulings: {},';
}

for (const [nome, r] of Object.entries(entrada)) {
  const arquivo = join(raiz, 'cartas', 'defs', `${slug(nome)}.ts`);
  if (!existsSync(arquivo)) { console.log(`sem arquivo: ${nome}`); continue; }
  let s = readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n');
  const bloco = render(r);
  const existente = /\n {2}rulings: \{[\s\S]*?\n? {0,2}\},?\n/;
  if (/\n {2}rulings: \{\},?\n/.test(s)) s = s.replace(/\n {2}rulings: \{\},?\n/, `\n${bloco}\n`);
  else if (/\n {2}rulings: \{\n[\s\S]*?\n {2}\},\n/.test(s)) s = s.replace(/\n {2}rulings: \{\n[\s\S]*?\n {2}\},\n/, `\n${bloco}\n`);
  else {
    const i = s.lastIndexOf('});');
    if (i < 0) { console.log(`formato inesperado: ${nome}`); continue; }
    let antes = s.slice(0, i).replace(/\s*$/, '');
    if (!antes.endsWith(',')) antes += ',';
    s = `${antes}\n${bloco}\n${s.slice(i)}`;
  }
  void existente;
  writeFileSync(arquivo, s);
}
console.log(`${Object.keys(entrada).length} cartas atualizadas`);
