// Lista os rulings de cartas, numerados a partir de 1, para registrar a conferência na definição.
// Uso: node ferramentas/rulings.ts "Nome da Carta" ["Outra"...]  |  --pendentes (cartas implementadas sem rulings conferidos)

import '../cartas/index.ts';
import { registry } from '../motor/defs.ts';
import { cartasPorNome, rulingsPorOracle } from '../servidor/catalogo/base.ts';

// ../cartas e as cartas novas dos decks importados (decks/cartas.json e decks/rulings.json)
const rulings = rulingsPorOracle();
const byName = cartasPorNome();

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
