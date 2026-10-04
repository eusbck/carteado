// Lista os rulings de cartas, numerados a partir de 1, para registrar a conferência na definição.
// Uso: node ferramentas/rulings.ts "Nome da Carta" ["Outra"...]  |  --pendentes (cartas implementadas sem rulings conferidos)

import '../cartas/index.ts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry } from '../motor/defs.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, '..', 'cartas', 'data');
const cards = JSON.parse(readFileSync(join(fonte, 'cards.json'), 'utf8')) as Record<string, { name: string; oracle_id: string }>;
const rulings = JSON.parse(readFileSync(join(fonte, 'rulings.json'), 'utf8')).by_oracle_id as Record<string, { comment: string; published_at: string }[]>;
const byName = new Map(Object.values(cards).map((c) => [c.name, c]));

let names = process.argv.slice(2);
if (names[0] === '--pendentes') {
  names = [...registry.cards.values()].filter((d) => !d.pending).filter((d) => {
    const total = (rulings[byName.get(d.name)?.oracle_id ?? ''] ?? []).length;
    return Object.keys(d.rulings ?? {}).length < total;
  }).map((d) => d.name);
}
for (const n of names) {
  const c = byName.get(n);
  if (!c) { console.log(`?? ${n}`); continue; }
  const list = rulings[c.oracle_id] ?? [];
  console.log(`## ${n} (${list.length})`);
  list.forEach((r, i) => console.log(`${i + 1}. ${r.comment}`));
}
