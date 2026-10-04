// Gera cartas/index.ts, que importa as fichas e todas as definições em cartas/defs.
// Uso: node ferramentas/gerar-indice.ts

import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'cartas', 'defs');
const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).sort();
const linhas = [
  '// Gerado por ferramentas/gerar-indice.ts. Não edite à mão.',
  "import './fichas.ts';",
  ...arquivos.map((f) => `import './defs/${f}';`),
  "import { registrarPendentes } from './pendentes.ts';",
  '',
  'registrarPendentes();',
  '',
];
writeFileSync(join(raiz, 'cartas', 'index.ts'), linhas.join('\n'));
console.log(`${arquivos.length} arquivos de definição`);
