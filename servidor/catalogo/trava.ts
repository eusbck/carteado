// Trava de gravação de decks/ e gerado/: o servidor (importação pela tela) e a linha de comando
// (ferramentas/decks.ts) nunca gravam ao mesmo tempo. Uma trava esquecida por um processo que morreu é ignorada.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class ErroTrava extends Error {}

function vivo(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (e) { return (e as NodeJS.ErrnoException).code === 'EPERM'; }
}

export async function comTrava<T>(pasta: string, f: () => Promise<T>): Promise<T> {
  mkdirSync(pasta, { recursive: true });
  const arq = join(pasta, '.trava');
  for (let tentativa = 0; ; tentativa++) {
    try {
      writeFileSync(arq, JSON.stringify({ pid: process.pid, desde: new Date().toISOString() }), { flag: 'wx' });
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST' || tentativa > 0) throw new ErroTrava('Outra importação está gravando os decks agora; tente de novo daqui a pouco');
      let pid = 0;
      try { pid = Number(JSON.parse(readFileSync(arq, 'utf8')).pid); } catch { /* trava ilegível: velha */ }
      if (pid && vivo(pid)) throw new ErroTrava('Outra importação está gravando os decks agora; tente de novo daqui a pouco');
      rmSync(arq, { force: true });
    }
  }
  try {
    return await f();
  } finally {
    if (existsSync(arq)) rmSync(arq, { force: true });
  }
}
