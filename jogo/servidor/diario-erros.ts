// Os últimos erros e avisos do servidor (console.error e console.warn), guardados em memória para irem junto dos
// relatos de erro: quando alguém reporta, o relato leva o que o servidor registrou pouco antes. As mensagens comuns
// (console.log) ficam numa lista à parte, só para a área do desenvolvedor.

export interface LinhaDiario {
  em: number;
  nivel: 'erro' | 'aviso' | 'info';
  texto: string;
}

const MAXIMO = 200;
const linhas: LinhaDiario[] = [];
/** as mensagens comuns (console.log), separadas para não empurrarem os erros para fora */
const MAXIMO_INFO = 300;
const infos: LinhaDiario[] = [];
let instalado = false;

function texto(args: unknown[]): string {
  return args.map((a) => (a instanceof Error ? (a.stack ?? `${a.name}: ${a.message}`) : typeof a === 'string' ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })())).join(' ').slice(0, 8000);
}

/** passa a guardar o que vai para console.error e console.warn (o que já aparecia continua aparecendo) */
export function instalarDiario(): void {
  if (instalado) return;
  instalado = true;
  for (const [metodo, nivel] of [['error', 'erro'], ['warn', 'aviso']] as const) {
    const original = console[metodo].bind(console);
    console[metodo] = (...args: unknown[]) => {
      linhas.push({ em: Date.now(), nivel, texto: texto(args) });
      if (linhas.length > MAXIMO) linhas.splice(0, linhas.length - MAXIMO);
      original(...args);
    };
  }
  const log = console.log.bind(console);
  console.log = (...args: unknown[]) => {
    infos.push({ em: Date.now(), nivel: 'info', texto: texto(args) });
    if (infos.length > MAXIMO_INFO) infos.splice(0, infos.length - MAXIMO_INFO);
    log(...args);
  };
}

/** tudo o que está guardado (erros, avisos e mensagens), na ordem do tempo: para a área do desenvolvedor */
export function diarioCompleto(): LinhaDiario[] {
  return [...linhas, ...infos].sort((a, b) => a.em - b.em);
}

/** as linhas dos últimos `ms` milissegundos (as mais antigas primeiro) */
export function diarioRecente(ms = 60 * 60_000): LinhaDiario[] {
  const desde = Date.now() - ms;
  return linhas.filter((l) => l.em >= desde);
}
