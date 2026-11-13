// Relatos de erro: confere o pedido do cliente (PedidoRelato), separa as imagens em arquivos e grava cada relato numa
// pasta própria em dados-locais/relatos/<id>/:
//   relato.json   o que a pessoa escreveu, o contexto do cliente e o do servidor (sem as imagens)
//   partida.json  a partida da sala (config, listas, entradas, checkpoints): ferramentas/relatos.ts refaz o erro
//   01-tela.webp… as imagens, na ordem em que vieram
// Quem cuida do jogo lê com: node ferramentas/relatos.ts listar | ver <id> | reproduzir <id> | resolver <id>

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PedidoRelato, RepeteRelato, TipoRelato } from './protocolo.ts';

export const LIMITE_CORPO_RELATO = 40 * 1024 * 1024;
export const MAX_IMAGENS = 8;
/** por imagem, já decodificada */
export const MAX_BYTES_IMAGEM = 8 * 1024 * 1024;

const TIPOS: TipoRelato[] = ['regra', 'visual', 'travou', 'bot', 'outro'];
const REPETE: RepeteRelato[] = ['sempre', 'as-vezes', 'uma-vez', 'nao-sei'];
const EXTENSAO: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** o relato gravado em relato.json */
export interface RelatoGravado {
  id: string;
  em: string;
  estado: 'aberto' | 'resolvido';
  resolucao?: { em: string; nota: string } | null;
  tipo: TipoRelato;
  oque: string;
  esperado: string;
  passos: string;
  repete: RepeteRelato;
  cartas: string[];
  nome: string;
  imagens: { arquivo: string; origem: string; nome?: string; marcada?: boolean; bytes: number }[];
  /** a partida foi junto (partida.json) */
  partida: boolean;
  /** pediu a partida, mas o token não conferiu ou não havia partida */
  partidaAusente?: string;
  contexto: Record<string, unknown>;
  servidor: Record<string, unknown>;
}

const texto = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export interface ImagemDecodificada { tipo: string; bytes: Buffer; origem: string; nome?: string; marcada?: boolean }

/** confere e limpa o pedido; devolve o erro (para a pessoa) quando não serve */
export function conferirPedido(bruto: unknown): { pedido: PedidoRelato; imagens: ImagemDecodificada[] } | { erro: string } {
  if (!bruto || typeof bruto !== 'object') return { erro: 'Pedido inválido' };
  const b = bruto as Record<string, unknown>;
  const oque = texto(b.oque, 8000);
  if (oque.length < 3) return { erro: 'Conte o que aconteceu' };
  const tipo = TIPOS.includes(b.tipo as TipoRelato) ? (b.tipo as TipoRelato) : 'outro';
  const repete = REPETE.includes(b.repete as RepeteRelato) ? (b.repete as RepeteRelato) : 'nao-sei';
  const cartas = Array.isArray(b.cartas) ? [...new Set(b.cartas.map((c) => texto(c, 160)).filter(Boolean))].slice(0, 30) : [];
  const brutas = Array.isArray(b.imagens) ? b.imagens : [];
  if (brutas.length > MAX_IMAGENS) return { erro: `No máximo ${MAX_IMAGENS} imagens` };
  const imagens: ImagemDecodificada[] = [];
  for (const im of brutas) {
    const i = (im ?? {}) as Record<string, unknown>;
    const m = typeof i.dados === 'string' ? i.dados.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/) : null;
    if (!m) return { erro: 'Uma das imagens não é PNG, JPEG nem WebP' };
    const bytes = Buffer.from(m[2], 'base64');
    if (bytes.length > MAX_BYTES_IMAGEM) return { erro: 'Uma das imagens é grande demais (máximo 8 MB)' };
    imagens.push({ tipo: m[1], bytes, origem: ['tela', 'aba', 'anexo'].includes(i.origem as string) ? (i.origem as string) : 'anexo', nome: texto(i.nome, 120) || undefined, marcada: i.marcada === true || undefined });
  }
  const s = b.sala as Record<string, unknown> | null | undefined;
  const sala = s && typeof s.codigo === 'string' && typeof s.token === 'string' ? { codigo: s.codigo.slice(0, 20), token: s.token.slice(0, 200) } : null;
  const contexto = b.contexto && typeof b.contexto === 'object' && !Array.isArray(b.contexto) ? (b.contexto as Record<string, unknown>) : {};
  return {
    pedido: {
      tipo, oque, esperado: texto(b.esperado, 4000), passos: texto(b.passos, 4000), repete, cartas, nome: texto(b.nome, 60),
      imagens: [], sala, anexarPartida: b.anexarPartida !== false, contexto,
    },
    imagens,
  };
}

/** id que ordena pela data e não se repete: 20261112-213005-k3f9 */
function novoId(agora: Date): string {
  const d = (n: number) => String(n).padStart(2, '0');
  const data = `${agora.getFullYear()}${d(agora.getMonth() + 1)}${d(agora.getDate())}-${d(agora.getHours())}${d(agora.getMinutes())}${d(agora.getSeconds())}`;
  return `${data}-${randomBytes(3).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, 'x').slice(0, 4)}`;
}

export class Relatos {
  readonly pasta: string;
  constructor(pasta: string) { this.pasta = pasta; }

  /** grava o relato e devolve o id */
  gravar(p: PedidoRelato, imagens: ImagemDecodificada[], partida: unknown | null, partidaAusente: string | null, servidor: Record<string, unknown>): string {
    const agora = new Date();
    const id = novoId(agora);
    const final = join(this.pasta, id);
    // grava numa pasta temporária e renomeia no fim: quem lista nunca vê um relato pela metade
    const tmp = join(this.pasta, `.${id}.tmp`);
    mkdirSync(tmp, { recursive: true });
    const arquivos = imagens.map((im, i) => {
      const arquivo = `${String(i + 1).padStart(2, '0')}-${im.origem}${im.marcada ? '-marcada' : ''}.${EXTENSAO[im.tipo]}`;
      writeFileSync(join(tmp, arquivo), im.bytes);
      return { arquivo, origem: im.origem, ...(im.nome ? { nome: im.nome } : {}), ...(im.marcada ? { marcada: true } : {}), bytes: im.bytes.length };
    });
    if (partida) writeFileSync(join(tmp, 'partida.json'), JSON.stringify(partida));
    const r: RelatoGravado = {
      id, em: agora.toISOString(), estado: 'aberto', resolucao: null,
      tipo: p.tipo, oque: p.oque, esperado: p.esperado ?? '', passos: p.passos ?? '', repete: p.repete ?? 'nao-sei', cartas: p.cartas ?? [], nome: p.nome ?? '',
      imagens: arquivos, partida: !!partida, ...(partidaAusente ? { partidaAusente } : {}),
      contexto: p.contexto, servidor,
    };
    writeFileSync(join(tmp, 'relato.json'), JSON.stringify(r, null, 2));
    renameSync(tmp, final);
    return id;
  }

  /** os relatos gravados, do mais novo para o mais antigo */
  listar(): RelatoGravado[] {
    if (!existsSync(this.pasta)) return [];
    return readdirSync(this.pasta, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.') && existsSync(join(this.pasta, d.name, 'relato.json')))
      .map((d) => JSON.parse(readFileSync(join(this.pasta, d.name, 'relato.json'), 'utf8')) as RelatoGravado)
      .sort((a, b) => b.id.localeCompare(a.id));
  }

  /** acha pelo id inteiro ou pelo começo/fim dele (o número curto que a pessoa recebe) */
  achar(parte: string): RelatoGravado | null {
    const todos = this.listar();
    return todos.find((r) => r.id === parte) ?? todos.find((r) => r.id.endsWith(parte) || r.id.startsWith(parte)) ?? null;
  }

  pastaDe(id: string): string { return join(this.pasta, id); }

  marcar(id: string, estado: 'aberto' | 'resolvido', nota = ''): void {
    const arq = join(this.pasta, id, 'relato.json');
    const r = JSON.parse(readFileSync(arq, 'utf8')) as RelatoGravado;
    r.estado = estado;
    r.resolucao = estado === 'resolvido' ? { em: new Date().toISOString(), nota } : null;
    writeFileSync(arq, JSON.stringify(r, null, 2));
  }
}

/** o número curto que a pessoa vê e pode mandar no chat: os 4 caracteres do fim do id */
export const numeroCurto = (id: string): string => id.slice(-4).toUpperCase();
