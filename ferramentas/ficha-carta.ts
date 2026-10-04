// Mostra Oracle (custo, tipo, texto, F/R) e rulings numerados das cartas pedidas, para escrever as definições.
// Uso: node ferramentas/ficha-carta.ts "Nome" ["Outro"...]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, '..', 'cartas', 'data');
const dados = JSON.parse(readFileSync(join(raiz, 'gerado', 'cartas.json'), 'utf8')) as { cartas: Record<string, { name: string; oracleId: string; faces: { name: string; manaCost: string; typeLine: string; oracleText: string; power: unknown; toughness: unknown; loyalty: unknown }[] }> };
const rulings = JSON.parse(readFileSync(join(fonte, 'rulings.json'), 'utf8')).by_oracle_id as Record<string, { comment: string }[]>;
for (const n of process.argv.slice(2)) {
  const c = dados.cartas[n];
  if (!c) { console.log(`?? ${n}\n`); continue; }
  for (const f of c.faces) {
    const pt = f.power !== null ? ` ${f.power}/${f.toughness}` : f.loyalty !== null ? ` [${f.loyalty}]` : '';
    console.log(`## ${f.name} ${f.manaCost} — ${f.typeLine}${pt}\n${f.oracleText}`);
  }
  (rulings[c.oracleId] ?? []).forEach((r, i) => console.log(`  ${i + 1}. ${r.comment}`));
  console.log('');
}
