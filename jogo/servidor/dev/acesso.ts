// Área do desenvolvedor: quem entra e como. É separada da senha do grupo (senha-acesso.txt):
//   - chave própria, longa e sorteada (SENHA_DEV, ou dados-locais/senha-dev.txt, criada na primeira vez);
//   - por padrão só do próprio computador (localhost, sem passar pelo túnel); DEV_REMOTO=1 libera pela internet;
//   - sessão própria (cookie `dev`, HttpOnly, SameSite=Strict, 12 h), guardada no banco só pelo hash;
//   - poucas tentativas por endereço e um limite geral por hora; cada entrada e cada erro de chave fica em
//     dados-locais/dev-acessos.log.

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { join } from 'node:path';
import type { Banco } from '../banco.ts';

export const DURACAO_SESSAO_DEV = 12 * 3600_000;
const TENTATIVAS_POR_IP = 5;
const JANELA_IP = 15 * 60_000;
const ERROS_POR_HORA = 20;

const hash = (s: string) => createHash('sha256').update(s).digest('hex');

/** a chave do desenvolvedor: SENHA_DEV, ou o arquivo (criado com 32 bytes sorteados na primeira vez) */
export function chaveDev(dados: string, env = process.env): { chave: string; criada: boolean; arquivo: string | null } {
  if (env.SENHA_DEV) return { chave: env.SENHA_DEV, criada: false, arquivo: null };
  const arquivo = join(dados, 'senha-dev.txt');
  if (existsSync(arquivo)) {
    const c = readFileSync(arquivo, 'utf8').trim();
    if (c.length >= 16) return { chave: c, criada: false, arquivo };
  }
  mkdirSync(dados, { recursive: true });
  const chave = randomBytes(32).toString('base64url');
  writeFileSync(arquivo, chave + '\n', { mode: 0o600 });
  return { chave, criada: true, arquivo };
}

function cookies(req: IncomingMessage): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of (req.headers.cookie ?? '').split(';')) {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  }
  return out;
}

/** veio do próprio computador, sem passar por túnel ou proxy (que sempre mandam o endereço de quem pediu) */
export function pedidoLocal(req: IncomingMessage): boolean {
  const a = req.socket.remoteAddress ?? '';
  const loopback = a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
  const encaminhado = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers.forwarded || req.headers['cf-ray'];
  return loopback && !encaminhado;
}

export interface OpcoesAcessoDev {
  banco: Banco;
  chave: string;
  dados: string;
  https: boolean;
  /** libera a área pela internet (DEV_REMOTO=1); sem isso, só localhost */
  remoto: boolean;
  ipDe: (req: IncomingMessage) => string;
  agora?: () => number;
}

export class AcessoDev {
  private o: OpcoesAcessoDev;
  private porIp = new Map<string, number[]>();
  private erros: number[] = [];
  private agora: () => number;
  private log: string;

  constructor(o: OpcoesAcessoDev) {
    this.o = o;
    this.agora = o.agora ?? Date.now;
    this.log = join(o.dados, 'dev-acessos.log');
  }

  /** a área está liberada pela internet (DEV_REMOTO=1) */
  get remoto(): boolean { return this.o.remoto; }

  /** o pedido pode chegar à área (antes de olhar a chave ou a sessão) */
  alcancavel(req: IncomingMessage): boolean {
    return this.o.remoto || pedidoLocal(req);
  }

  private registrar(req: IncomingMessage, o: string): void {
    const linha = `${new Date(this.agora()).toISOString()} ${o} ip=${this.o.ipDe(req)} local=${pedidoLocal(req) ? 'sim' : 'nao'} agente=${JSON.stringify(String(req.headers['user-agent'] ?? '').slice(0, 160))}\n`;
    try { mkdirSync(this.o.dados, { recursive: true }); appendFileSync(this.log, linha); } catch { /* o log não pode derrubar a entrada */ }
  }

  /** confere a chave; devolve o cookie da sessão nova ou o erro (com o status HTTP) */
  entrar(req: IncomingMessage, chave: string): { cookie: string } | { status: number; erro: string } {
    if (!this.alcancavel(req)) { this.registrar(req, 'RECUSADO-REMOTO'); return { status: 404, erro: 'Rota desconhecida' }; }
    const agora = this.agora();
    const ip = this.o.ipDe(req);
    const l = (this.porIp.get(ip) ?? []).filter((t) => agora - t < JANELA_IP);
    this.erros = this.erros.filter((t) => agora - t < 3600_000);
    if (l.length >= TENTATIVAS_POR_IP || this.erros.length >= ERROS_POR_HORA) {
      this.registrar(req, 'BLOQUEADO');
      return { status: 429, erro: 'Muitas tentativas erradas; espere alguns minutos' };
    }
    const a = Buffer.from(hash(chave));
    const b = Buffer.from(hash(this.o.chave));
    if (!chave || !timingSafeEqual(a, b)) {
      l.push(agora);
      this.porIp.set(ip, l);
      this.erros.push(agora);
      this.registrar(req, 'CHAVE-ERRADA');
      return { status: 401, erro: 'Chave incorreta' };
    }
    this.porIp.delete(ip);
    const token = randomBytes(32).toString('base64url');
    this.o.banco.criarSessaoDev(hash(token), agora, agora + DURACAO_SESSAO_DEV, ip, String(req.headers['user-agent'] ?? '').slice(0, 200));
    this.registrar(req, 'ENTROU');
    return { cookie: `dev=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DURACAO_SESSAO_DEV / 1000}${this.o.https ? '; Secure' : ''}` };
  }

  /** a sessão do pedido, se for válida (e o pedido puder chegar à área) */
  sessao(req: IncomingMessage): string | null {
    if (!this.alcancavel(req)) return null;
    const t = cookies(req).dev;
    if (!t) return null;
    const h = hash(t);
    const s = this.o.banco.sessaoDev(h);
    if (!s) return null;
    if (s.expira < this.agora()) { this.o.banco.apagarSessaoDev(h); return null; }
    return h;
  }

  sair(req: IncomingMessage): string {
    const h = this.sessao(req);
    if (h) { this.o.banco.apagarSessaoDev(h); this.registrar(req, 'SAIU'); }
    return `dev=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${this.o.https ? '; Secure' : ''}`;
  }

  /** as sessões abertas (para a tela Acesso), marcando a deste pedido */
  sessoes(atual: string | null): { id: string; criada: number; expira: number; ip: string; agente: string; esta: boolean }[] {
    const agora = this.agora();
    return this.o.banco.sessoesDev().filter((s) => s.expira >= agora).map((s) => ({ id: s.hash.slice(0, 12), criada: s.criada, expira: s.expira, ip: s.ip, agente: s.agente, esta: s.hash === atual }));
  }

  /** encerra as outras sessões (ou uma, pelo começo do hash) */
  encerrar(atual: string | null, id: string | null): number {
    let n = 0;
    for (const s of this.o.banco.sessoesDev()) {
      if (s.hash === atual) continue;
      if (id && !s.hash.startsWith(id)) continue;
      this.o.banco.apagarSessaoDev(s.hash);
      n++;
    }
    return n;
  }

  /** as últimas linhas do registro de acessos */
  acessos(n = 60): string[] {
    if (!existsSync(this.log)) return [];
    return readFileSync(this.log, 'utf8').trimEnd().split('\n').slice(-n).reverse();
  }
}
