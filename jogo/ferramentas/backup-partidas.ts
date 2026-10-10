// Cópia consistente de SQLite, incluindo alterações confirmadas que ainda estão no WAL.
// Uso: node ferramentas/backup-partidas.ts <origem.sqlite> <destino-novo.sqlite>
import { backup, DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function copiarPartidas(origem: string, destino: string): Promise<{ paginas: number; integridade: string }> {
  const source = resolve(origem), target = resolve(destino);
  if (source.toLowerCase() === target.toLowerCase()) throw new Error('Origem e destino precisam ser diferentes');
  if (!existsSync(source)) throw new Error('Banco de origem não encontrado');
  if (existsSync(target)) throw new Error('O destino já existe; preserve a versão anterior e escolha um novo arquivo');
  mkdirSync(dirname(target), { recursive: true });
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    const paginas = await backup(db, target);
    const check = new DatabaseSync(target, { readOnly: true });
    try {
      const row = check.prepare('PRAGMA integrity_check').get()!;
      const integridade = String(Object.values(row)[0]);
      if (integridade !== 'ok') throw new Error(`Backup inconsistente: ${integridade}`);
      return { paginas, integridade };
    } finally { check.close(); }
  } finally { db.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [origem, destino] = process.argv.slice(2);
  if (!origem || !destino) throw new Error('Informe o banco de origem e um novo caminho de destino');
  console.log(await copiarPartidas(origem, destino));
}
