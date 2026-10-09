// Servidor: HTTP (cliente, imagens, API) e WebSocket (salas e partidas).
// Acesso privado: tudo além da página de entrada exige a senha do servidor (cookie de sessão);
// cada sala tem ainda seu código e sua senha.
//
// Uso: node servidor/index.ts   (variáveis: PORTA, SENHA_ACESSO, DADOS, HTTPS=1 atrás de proxy, ESTATICOS)

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import '../cartas/index.ts';
import { oracle } from '../motor/oracle.ts';
import type { DeckList } from '../motor/state.ts';
import { Banco } from './banco.ts';
import { infoCartas } from './cartas-info.ts';
import { pastasPadrao } from './catalogo/caminhos.ts';
import { Catalogo, infoDoDisco } from './catalogo/catalogo.ts';
import { regenerar } from './catalogo/gerar.ts';
import { cartaPronta } from './catalogo/prontidao.ts';
import { redeReal } from './catalogo/rede.ts';
import { RotasCatalogo } from './catalogo/rotas.ts';
import { TarefasDecks } from './catalogo/tarefas.ts';
import { Arquivos } from './http-arquivos.ts';
import { Imagens, type Tamanho } from './imagens.ts';
import { tipoMsg, type DeckResumo, type MsgCliente, type MsgServidor } from './protocolo.ts';
import { Gerente, type Conexao } from './salas.ts';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA ?? 8080);
const DADOS = process.env.DADOS ?? join(RAIZ, 'dados-locais');
// o cliente compilado (ESTATICOS: outra pasta, para os testes do HTTP)
const ESTATICOS = resolve(process.env.ESTATICOS ?? join(RAIZ, 'cliente', 'dist'));
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

// decks da mesa: decks/ (um arquivo por deck), importados ou atualizados pela tela Decks. Só entram no saguão os que
// têm regras para todas as cartas; as partidas guardam as listas com que começaram.
const pastas = pastasPadrao();
const catalogo = new Catalogo({ pasta: pastas.decks, pronta: cartaPronta });
if (!catalogo.todos().length) console.warn('Nenhum deck em decks/: rode node ferramentas/decks.ts migrar');
const gerente = new Gerente(banco, catalogo.listasJogaveis());
gerente.restaurar();
// versões que esperavam cartas e agora têm todas prontas (implementadas desde a última vez) entram no saguão
// depois de restaurar: as salas antigas guardam antes as listas com que começaram
const aplicados = catalogo.aplicarPreparacoesProntas();
if (aplicados.length) {
  regenerar(pastas, catalogo.todos());
  gerente.trocarDecks(catalogo.listasJogaveis());
  console.log(`Decks que ficaram prontos: ${aplicados.join(', ')}`);
}
const imagens = new Imagens(join(RAIZ, '..', 'cartas'), join(RAIZ, '.cache', 'miniaturas'), undefined, [pastas.imagens]);
const INFO = JSON.stringify(infoCartas());
const resumir = (decks: DeckList[]): DeckResumo[] => decks.map((d) => ({ id: d.id, nome: d.nome, comandante: d.comandante, cores: oracle(d.comandante).colorIdentity }));
let resumoDecks = resumir(catalogo.listasJogaveis());

const tarefas: TarefasDecks = new TarefasDecks({
  pastas,
  rede: redeReal(),
  catalogo,
  pronta: cartaPronta,
  aoMudar: (listasMudaram) => {
    if (listasMudaram) {
      const listas = catalogo.listasJogaveis();
      gerente.trocarDecks(listas);
      resumoDecks = resumir(listas);
      anunciar({ t: 'decks', decks: resumoDecks });
    }
    anunciar({ t: 'catalogo', tarefa: tarefas.tarefa, mudou: true });
  },
  aoAndamento: (t) => anunciar({ t: 'catalogo', tarefa: t, mudou: false }),
});
const rotasCatalogo = new RotasCatalogo({ catalogo, tarefas, info: infoDoDisco(pastas.gerado) });

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

/** atrás do túnel/proxy (HTTPS=1) todos chegam pelo mesmo endereço local: usa o IP real informado pelo proxy */
function ipDe(req: IncomingMessage): string {
  const encaminhado = HTTPS ? String(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
  return encaminhado || req.socket.remoteAddress || '?';
}

function confereSenhaAcesso(s: string): boolean {
  const a = Buffer.from(s);
  const b = Buffer.from(SENHA);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
function json(res: ServerResponse, status: number, corpo: unknown, extra: Record<string, string> = {}): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  res.end(typeof corpo === 'string' ? corpo : JSON.stringify(corpo));
}

// arquivos com ETag (304 quando o navegador já tem), brotli/gzip calculado uma vez e intervalo de bytes (servidor/
// http-arquivos.ts). O cliente compilado é comprimido logo ao subir.
const arquivos = new Arquivos();
if (existsSync(ESTATICOS)) for (const f of readdirSync(ESTATICOS, { recursive: true, withFileTypes: true })) if (f.isFile()) arquivos.preparar(join(f.parentPath, f.name));
const arquivo = (req: IncomingMessage, res: ServerResponse, caminho: string, cache: string) => arquivos.arquivo(req, res, caminho, cache);

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
    const ip = ipDe(req);
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

  if (p === '/api/decks') return json(res, 200, resumoDecks);
  // as informações das cartas (centenas de KB): o navegador revalida pelo ETag e só baixa de novo quando mudam
  if (p === '/api/cartas') return arquivos.texto(req, res, INFO, 'application/json; charset=utf-8', 'private, no-cache');
  if (p === '/api/catalogo' || p.startsWith('/api/catalogo/')) {
    let corpo = '';
    if (req.method === 'POST') {
      try { corpo = await lerCorpo(req); } catch { return json(res, 413, { erro: 'Pedido grande demais' }); }
    }
    const r = rotasCatalogo.tratar(req.method ?? 'GET', p, corpo, ipDe(req));
    if (r) return json(res, r.status, r.corpo);
  }

  let m = p.match(/^\/img\/([0-9a-f-]{36})\/(frente|verso)\/(p|m|g)$/);
  if (m) {
    const caminho = await imagens.carta(m[1], m[2] as 'frente' | 'verso', m[3] as Tamanho);
    if (!caminho) return json(res, 404, { erro: 'Imagem não encontrada' });
    return arquivo(req, res,caminho, 'private, max-age=604800, immutable');
  }
  // arte do comandante: `arte` para a miniatura do deck, `fundo` (maior) para a área do jogador
  m = p.match(/^\/img\/([0-9a-f-]{36})\/(arte|fundo)$/);
  if (m) {
    const caminho = await imagens.arte(m[1], m[2] as 'arte' | 'fundo');
    if (!caminho) return json(res, 404, { erro: 'Imagem não encontrada' });
    return arquivo(req, res,caminho, 'private, max-age=604800, immutable');
  }
  m = p.match(/^\/simbolo\/([A-Z0-9-]{1,12})$/);
  if (m) {
    const caminho = imagens.simbolo(m[1]);
    if (!caminho) return json(res, 404, { erro: 'Símbolo não encontrado' });
    return arquivo(req, res,caminho, 'private, max-age=604800, immutable');
  }
  if (p.startsWith('/api/')) return json(res, 404, { erro: 'Rota desconhecida' });

  // cliente (página única)
  if (!existsSync(ESTATICOS)) { res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Cliente não compilado: rode npm run cliente:build'); return; }
  const alvo = normalize(join(ESTATICOS, decodeURIComponent(p)));
  // dentro da pasta (com o separador: "dist2" ao lado de "dist" não serve)
  if (alvo.startsWith(ESTATICOS + sep) && existsSync(alvo) && statSync(alvo).isFile()) {
    return arquivo(req, res,alvo, p.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
  }
  return arquivo(req, res,join(ESTATICOS, 'index.html'), 'no-cache');
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
// permessage-deflate nas mensagens a partir de 1 KB: a vista da mesa (20 a 60 KB em JSON) cai umas 9 vezes com o
// contexto mantido entre mensagens (as vistas seguidas são quase iguais); as pequenas (chat, batimento) vão cruas
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024, perMessageDeflate: { threshold: 1024 } });

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
wss.on('error', (e) => console.error('ws (servidor):', e));
wss.on('connection', (ws: WebSocket) => {
  vivos.set(ws, true);
  ws.on('pong', () => vivos.set(ws, true));
  // frame grande demais (maxPayload), frame malformado, conexão cortada: o ws fecha a conexão e avisa aqui. Sem este
  // tratador o 'error' sem ouvinte virava exceção e derrubava o servidor inteiro
  ws.on('error', (e) => console.error('ws (conexão):', e.message));
  const enviarTexto = (texto: string) => { if (ws.readyState === ws.OPEN) ws.send(texto); };
  const con: Conexao = {
    sala: null, assento: null,
    enviar(m: MsgServidor) { enviarTexto(JSON.stringify(m)); },
    enviarTexto,
  };
  ws.on('message', (dados) => {
    let m: MsgCliente;
    try { m = JSON.parse(String(dados)); } catch { con.enviar({ t: 'erro', msg: 'Mensagem inválida' }); return; }
    try { gerente.tratar(con, m); } catch (e) {
      console.error('ws:', e);
      const de = tipoMsg(m);
      con.enviar({ t: 'erro', msg: 'Erro interno do servidor', ...(de ? { de } : {}) });
    }
  });
  ws.on('close', () => gerente.desconectar(con));
});

/** mensagem para todas as conexões (telas Decks e saguões abertos) */
function anunciar(m: MsgServidor): void {
  const texto = JSON.stringify(m);
  for (const ws of wss.clients) if (ws.readyState === ws.OPEN) ws.send(texto);
}

setInterval(() => {
  for (const ws of wss.clients) {
    if (!vivos.get(ws)) { ws.terminate(); continue; }
    vivos.set(ws, false);
    ws.ping();
  }
}, 30_000).unref();

http.listen(PORTA, () => {
  const a = http.address();
  console.log(`Magic Commander: http://localhost:${a && typeof a === 'object' ? a.port : PORTA}`);
});

function encerrar(): void {
  http.close();
  // chat, posições e retratos esperando a gravação agrupada
  try { gerente.salvarTudo(); } catch (e) { console.error('gravar ao encerrar:', e); }
  banco.fechar();
  process.exit(0);
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
// rede de segurança: um erro que escapou de todos os tratadores fica no registro e o servidor continua de pé (as
// salas têm o próprio tratamento: a que falhou se refaz das entradas gravadas). abrir-mesa.ps1 religa o servidor se
// mesmo assim ele cair.
process.on('unhandledRejection', (e) => console.error('promessa rejeitada sem tratamento:', e));
process.on('uncaughtException', (e) => console.error('exceção sem tratamento:', e));
