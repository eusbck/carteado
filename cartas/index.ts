// Carrega as fichas e todas as definições de cartas em cartas/defs (exceto testes),
// depois registra as cartas ainda sem definição como pendentes (modo manual).
import './fichas.ts';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registrarPendentes } from './pendentes.ts';

const pasta = join(dirname(fileURLToPath(import.meta.url)), 'defs');
for (const f of readdirSync(pasta).filter((x) => x.endsWith('.ts') && !x.endsWith('.test.ts')).sort()) {
  await import(pathToFileURL(join(pasta, f)).href);
}
registrarPendentes();
