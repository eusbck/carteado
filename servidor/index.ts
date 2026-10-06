// Servidor: HTTP (cliente, imagens, API) e WebSocket (salas e partidas).
// Acesso privado: tudo além da página de entrada exige a senha do servidor (cookie de sessão);
// cada sala tem ainda seu código e sua senha.
//
// Uso: node servidor/index.ts   (variáveis: PORTA, SENHA_ACESSO, DADOS, HTTPS=1 atrás de proxy)

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import '../cartas/index.ts';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { oracle } from '../motor/oracle.ts';
import type { DeckList } from '../motor/state.ts';
import { Banco } from './banco.ts';
import { infoCartas } from './cartas-info.ts';
import { Imagens, type Tamanho } from './imagens.ts';
import type { DeckResumo, MsgCliente, MsgServidor } from './protocolo.ts';
import { Gerente, type Conexao } from './salas.ts';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA ?? 8080);
const DADOS = process.env.DADOS ?? join(RAIZ, 'dados-locais');
const ESTATICOS = join(RAIZ, 'cliente', 'dist');
const HTTPS = process.env.HTTPS === '1';

function senhaDeAcesso(): string {
  if (process.env.SENHA_ACESSO) return process.env.SENHA_ACESSO;
  const arq = join(DADOS, 'senha-acesso.txt');
  if (existsSync(arq)) return readFileSync(arq, 'utf8').trim();
  mkdirSync(DADOS, { recursive: true });
  const s = randomBytes(9).toString('base64url');
  writeFileSync(arq, s + '\n');
  console.log(`Senha de acesso gerada e guardada em ${arq}: ${s}`);
  return s;
}

const SENHA = senhaDeAcesso();
const banco = new Banco(join(DADOS, 'jogo.sqlite'));
const DECKS = decksJson as DeckList[];
const gerente = new Gerente(banco, DECKS);
gerente.restaurar();
const imagens = new Imagens(join(RAIZ, '..', 'cartas'), join(RAIZ, '.cache', 'miniaturas'));
const INFO = JSON.stringify(infoCartas());
const RESUMO_DECKS: DeckResumo[] = DECKS.map((d) => ({ id: d.id, nome: d.nome, comandante: d.comandante, cores: oracle(d.comandante).colorIdentity }));

// ---------------------------------------------------------------------------
// sessões
// ---------------------------------------------------------------------------
function cookies(req: IncomingMessage): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of (req.headers.cookie ?? '').split(';')) {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  }
  return out;
}
const autenticado = (req: IncomingMessage) => { const t = cookies(req).sessao; return !!t && banco.sessaoValida(t); };

const tentativas = new Map<string, number[]>();
function muitasTentativas(ip: string): boolean {
  const agora = Date.now();
  const l = (tentativas.get(ip) ?? []).filter((t) => agora - t < 60_000);
  l.push(agora);
  tentativas.set(ip, l);
  return l.length > 10;
}

function confereSenhaAcesso(s: string): boolean {
  const a = Buffer.from(s);
  const b = Buffer.from(SENHA);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

function json(res: ServerResponse, status: number, corpo: unknown, extra: Record<string, string> = {}): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  res.end(typeof corpo === 'string' ? corpo : JSON.stringify(corpo));
}

function arquivo(res: ServerResponse, caminho: string, cache: string): void {
  res.writeHead(200, { 'content-type': TIPOS[extname(caminho)] ?? 'application/octet-stream', 'cache-control': cache, 'content-length': statSync(caminho).size });
  createReadStream(caminho).pipe(res);
}

async function lerCorpo(req: IncomingMessage, limite = 4096): Promise<string> {
  let s = '';
  for await (const parte of req) {
    s += parte;
    if (s.length > limite) throw new Error('corpo grande demais');
  }
  return s;
}

async function rotear(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://x');
  const p = url.pathname;
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');

  if (p === '/api/entrar' && req.method === 'POST') {
    // atrás do túnel/proxy (HTTPS=1) todos chegam pelo mesmo endereço local: usa o IP real informado pelo proxy
    const encaminhado = HTTPS ? String(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
    const ip = encaminhado || req.socket.remoteAddress || '?';
    if (muitasTentativas(ip)) return json(res, 429, { erro: 'Muitas tentativas; espere um minuto' });
    let senha = '';
    try { senha = String(JSON.parse(await lerCorpo(req)).senha ?? ''); } catch { return json(res, 400, { erro: 'Pedido inválido' }); }
    if (!confereSenhaAcesso(senha)) return json(res, 401, { erro: 'Senha incorreta' });
    const token = randomBytes(24).toString('base64url');
    banco.criarSessao(token);
    return json(res, 200, { ok: true }, { 'set-cookie': `sessao=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${HTTPS ? '; Secure' : ''}` });
  }
  if (p === '/api/sessao') return json(res, 200, { ok: autenticado(req) });

  // a partir daqui, só com sessão
  const precisaSessao = p.startsWith('/api/') || p.startsWith('/img/') || p.startsWith('/simbolo/');
  if (precisaSessao && !autenticado(req)) return json(res, 401, { erro: 'Entre com a senha do servidor' });

  if (p === '/api/decks') return json(res, 200, RESUMO_DECKS);
  if (p === '/api/cartas') return json(res, 200, INFO);

  let m = p.match(/^\/img\/([0-9a-f-]{36})\/(frente|verso)\/(p|m|g)$/);
  if (m) {
    const caminho = await imagens.carta(m[1], m[2] as 'frente' | 'verso', m[3] as Tamanho);
    if (!caminho) return json(res, 404, { erro: 'Imagem não encontrada' });
    return arquivo(res, caminho, 'private, max-age=604800, immutable');
  }
  m = p.match(/^\/simbolo\/([A-Z0-9-]{1,12})$/);
  if (m) {
    const caminho = imagens.simbolo(m[1]);
    if (!caminho) return json(res, 404, { erro: 'Símbolo não encontrado' });
    return arquivo(res, caminho, 'private, max-age=604800, immutable');
  }
  if (p.startsWith('/api/')) return json(res, 404, { erro: 'Rota desconhecida' });

  // cliente (página única)
  if (!existsSync(ESTATICOS)) { res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Cliente não compilado: rode npm run cliente:build'); return; }
  const alvo = normalize(join(ESTATICOS, decodeURIComponent(p)));
  if (alvo.startsWith(ESTATICOS) && existsSync(alvo) && statSync(alvo).isFile()) {
    return arquivo(res, alvo, p.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
  }
  return arquivo(res, join(ESTATICOS, 'index.html'), 'no-cache');
}

const http = createServer((req, res) => {
  rotear(req, res).catch((e) => {
    console.error('http:', e);
    if (!res.headersSent) json(res, 500, { erro: 'Erro interno' });
    else res.end();
  });
});

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

http.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname !== '/ws' || !autenticado(req)) {
    // resposta completa antes de fechar (atrás do túnel, fechar no meio às vezes vira erro 500)
    socket.end('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});

const vivos = new WeakMap<WebSocket, boolean>();
wss.on('connection', (ws: WebSocket) => {
  vivos.set(ws, true);
  ws.on('pong', () => vivos.set(ws, true));
  const con: Conexao = {
    sala: null, assento: null,
    enviar(m: MsgServidor) { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(m)); },
  };
  ws.on('message', (dados) => {
    let m: MsgCliente;
    try { m = JSON.parse(String(dados)); } catch { con.enviar({ t: 'erro', msg: 'Mensagem inválida' }); return; }
    try { gerente.tratar(con, m); } catch (e) { console.error('ws:', e); con.enviar({ t: 'erro', msg: 'Erro interno do servidor' }); }
  });
  ws.on('close', () => gerente.desconectar(con));
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!vivos.get(ws)) { ws.terminate(); continue; }
    vivos.set(ws, false);
    ws.ping();
  }
}, 30_000).unref();

http.listen(PORTA, () => console.log(`Commander da mesa: http://localhost:${PORTA}`));

function encerrar(): void {
  http.close();
  banco.fechar();
  process.exit(0);
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
