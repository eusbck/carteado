// Pedidos da área do desenvolvedor (/api/dev/*) e os tipos que voltam.

export class ErroApi extends Error {
  status: number;
  constructor(status: number, msg: string) { super(msg); this.status = status; }
}

export async function pedir<T>(caminho: string, corpo?: unknown): Promise<T> {
  const r = await fetch(`/api/dev/${caminho}`, corpo === undefined
    ? { cache: 'no-store' }
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
  let dados: unknown = null;
  try { dados = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) throw new ErroApi(r.status, (dados as { erro?: string } | null)?.erro ?? `Erro ${r.status}`);
  return dados as T;
}

export const urlArquivo = (id: string, nome: string) => `/api/dev/relatos/${id}/arquivo/${encodeURIComponent(nome)}`;

export interface Resumo {
  versao: string | null;
  git: { ramo: string; ultimo: string; alterados: number } | null;
  iniciadoEm: string;
  segundosNoAr: number;
  node: string;
  plataforma: string;
  pid: number;
  memoria: { rssMB: number; heapMB: number; heapTotalMB: number };
  atrasoLacoMs: { p50: number; p99: number; max: number };
  conexoes: number;
  salas: { total: number; porEstado: Record<string, number>; comErro: number; pessoasConectadas: number };
  relatos: { abertos: number; total: number; ultimo: string | null };
  errosCliente: { abertos: number; ocorrencias24h: number };
  servidor: { erros1h: number; avisos1h: number };
  decks: { total: number; jogaveis: number; emPreparacao: number };
}

export interface RelatoResumo {
  id: string; numero: string; em: string; estado: 'aberto' | 'resolvido'; resolucao: { em: string; nota: string } | null;
  tipo: string; repete: string; oque: string; nome: string; cartas: string[]; imagens: string[]; partida: boolean;
  tela: string | null; sala: string | null; versao: string | null;
}

export interface Ocorrencia { em: string; tipo: string; texto: string }
export interface LinhaDiario { em: number; nivel: 'erro' | 'aviso' | 'info'; texto: string }

export interface RelatoCompleto {
  relato: {
    id: string; em: string; estado: 'aberto' | 'resolvido'; resolucao?: { em: string; nota: string } | null;
    tipo: string; oque: string; esperado: string; passos: string; repete: string; cartas: string[]; nome: string;
    imagens: { arquivo: string; origem: string; nome?: string; marcada?: boolean; bytes: number }[];
    partida: boolean; partidaAusente?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contexto: Record<string, any>;
    servidor: { versao?: string; iniciadoEm?: string; node?: string; memoriaMB?: number; salas?: number; diario?: LinhaDiario[] };
  };
  numero: string;
  arquivos: { nome: string; bytes: number }[];
  reproducao: Reproducao | null;
  versaoAgora: string | null;
}

export interface Reproducao { rodando: boolean; inicio: number; fim: number | null; codigo: number | null; saida: string }

export interface ErroCliente {
  assinatura: string; tipo: 'erro' | 'promessa'; texto: string; pilha: string; tela: string; navegador: string;
  primeiro: number; ultimo: number; vezes: number; vezes24h: number; versao: string; pessoas: number; resolvido: boolean; resolvidoEm: number | null;
}

export interface SalaDev {
  codigo: string; estado: string; formato: string; etapa: string; anfitriao: number; conexoes: number;
  assentos: { nome: string | null; tipo: string; deck: string | null; nivel: string | null; conectado: boolean }[];
  partida: { id: string; iniciadaEm: number | null; encerradaEm: number | null; entradas: number | null; turno: number | null; rodada: number | null; vidas: { vida: number; perdeu: boolean }[] | null } | null;
  erro: string | null; falhas: number; atualizada: number | null;
}

export interface DecksDev {
  decks: { id: string; nome: string; comandante: string | null; formato: string; jogavel: boolean; temPreparacao: boolean; faltamAtual: string[]; faltamPreparacao: string[] }[];
  cartasFaltando: { nome: string; decks: string[] }[];
}

export interface AcessoDev {
  sessoes: { id: string; criada: number; expira: number; ip: string; agente: string; esta: boolean }[];
  acessos: string[];
  remoto: boolean;
}
