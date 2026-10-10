// Trava de gravação de decks/ e gerado/: o servidor (importação pela tela) e a linha de comando
// (ferramentas/decks.ts) nunca gravam ao mesmo tempo. Uma trava esquecida por um processo que morreu é ignorada.
// Dentro do servidor, as importações que andam juntas gravam uma de cada vez (a fila de tarefas.ts) antes de pedir a
// trava; com `esperar`, quem pede espera a outra ponta soltar em vez de desistir na hora.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class ErroTrava extends Error {}

function vivo(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (e) { return (e as NodeJS.ErrnoException).code === 'EPERM'; }
}

/** pega a trava; false se outro processo vivo está com ela */
function pegar(arq: string): boolean {
  for (let tentativa = 0; ; tentativa++) {
    try {
      writeFileSync(arq, JSON.stringify({ pid: process.pid, desde: new Date().toISOString() }), { flag: 'wx' });
      return true;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST' || tentativa > 0) return false;
      let pid = 0;
      try { pid = Number(JSON.parse(readFileSync(arq, 'utf8')).pid); } catch { /* trava ilegível: velha */ }
      if (pid && vivo(pid)) return false;
      rmSync(arq, { force: true });
    }
  }
}

export async function comTrava<T>(pasta: string, f: () => Promise<T>, o: { esperar?: number } = {}): Promise<T> {
  mkdirSync(pasta, { recursive: true });
  const arq = join(pasta, '.trava');
  const ate = Date.now() + (o.esperar ?? 0);
  while (!pegar(arq)) {
    if (Date.now() >= ate) throw new ErroTrava('Outra importação está gravando os decks agora; tente de novo daqui a pouco');
    await new Promise((ok) => setTimeout(ok, Math.min(500, Math.max(1, ate - Date.now()))));
  }
  try {
    return await f();
  } finally {
    if (existsSync(arq)) rmSync(arq, { force: true });
  }
}
