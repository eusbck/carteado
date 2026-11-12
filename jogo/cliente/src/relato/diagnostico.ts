// O que o cliente registra para os relatos de erro, desde que a página abre: erros da página (exceções, promessas
// rejeitadas, console.error), as últimas mensagens mandadas ao servidor e os erros que o servidor respondeu. Fica só
// na memória desta aba e só sai daqui dentro de um relato.

export interface Ocorrencia {
  /** ms desde que a página abriu (performance.now) */
  t: number;
  /** hora local, para cruzar com o diário do servidor */
  em: string;
  tipo: 'erro' | 'promessa' | 'console' | 'enviada' | 'servidor';
  texto: string;
}

const MAXIMO = 60;
const erros: Ocorrencia[] = [];
const enviadas: Ocorrencia[] = [];
const doServidor: Ocorrencia[] = [];
const inicio = Date.now();

function guardar(lista: Ocorrencia[], tipo: Ocorrencia['tipo'], texto: string): void {
  lista.push({ t: Math.round(performance.now()), em: new Date().toISOString(), tipo, texto: texto.slice(0, 4000) });
  if (lista.length > MAXIMO) lista.splice(0, lista.length - MAXIMO);
}

const descrever = (v: unknown): string => {
  if (v instanceof Error) return v.stack ?? `${v.name}: ${v.message}`;
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};

let instalado = false;
/** começa a registrar (main.tsx chama antes de desenhar a página) */
export function instalarDiagnostico(): void {
  if (instalado) return;
  instalado = true;
  addEventListener('error', (e) => {
    // erro de recurso (imagem que não carregou) vem sem `error`: só a origem interessa
    const alvo = e.target as HTMLElement | null;
    if (alvo && alvo !== (window as unknown) && 'src' in alvo) { guardar(erros, 'erro', `recurso não carregou: ${(alvo as HTMLImageElement).src}`); return; }
    guardar(erros, 'erro', e.error ? descrever(e.error) : `${e.message} (${e.filename}:${e.lineno}:${e.colno})`);
  }, true);
  addEventListener('unhandledrejection', (e) => guardar(erros, 'promessa', descrever(e.reason)));
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    guardar(erros, 'console', args.map(descrever).join(' '));
    original(...args);
  };
}

/** loja.enviar chama a cada mensagem (sem o batimento): o que a pessoa fez logo antes do erro */
export function registrarEnvio(m: { t: string }): void {
  if (m.t === 'ping') return;
  // senha da sala (criar, entrar) e token do assento (retomar) nunca vão para o relato
  guardar(enviadas, 'enviada', JSON.stringify(m, (k, v) => (/senha|token/i.test(k) && typeof v === 'string' ? '***' : v)));
}

/** erro que o servidor mandou (jogada recusada, erro interno do motor…) */
export function registrarErroServidor(msg: string): void {
  guardar(doServidor, 'servidor', msg);
}

export function diagnostico(): { erros: Ocorrencia[]; enviadas: Ocorrencia[]; doServidor: Ocorrencia[]; abertaHaSegundos: number } {
  return { erros: [...erros], enviadas: [...enviadas], doServidor: [...doServidor], abertaHaSegundos: Math.round((Date.now() - inicio) / 1000) };
}

/** quantos erros da página até agora (a janela do relato mostra) */
export const quantosErros = (): number => erros.length;
