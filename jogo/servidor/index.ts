// Servidor: HTTP (cliente, imagens, API) e WebSocket (salas e partidas).
// Acesso privado: tudo além da página de entrada exige a senha do servidor (cookie de sessão);
// cada sala tem ainda seu código e sua senha.
//
// Uso: node servidor/index.ts   (variáveis: PORTA, SENHA_ACESSO, DADOS, HTTPS=1 atrás de proxy, ESTATICOS)

import { execFileSync } from 'node:child_process';
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
import { diarioRecente, instalarDiario } from './diario-erros.ts';
import { infoCartas } from './cartas-info.ts';
import { pastasPadrao } from './catalogo/caminhos.ts';
import { capaDe, Catalogo, infoDoDisco } from './catalogo/catalogo.ts';
import { modoDe } from '../motor/modos.ts';
import { regenerar } from './catalogo/gerar.ts';
import { cartaPronta } from './catalogo/prontidao.ts';
import { redeReal } from './catalogo/rede.ts';
import { RotasCatalogo } from './catalogo/rotas.ts';
import { TarefasDecks } from './catalogo/tarefas.ts';
import { lerBanidas } from './catalogo/validar.ts';
import { Arquivos } from './http-arquivos.ts';
import { Imagens, type Tamanho } from './imagens.ts';
import { tipoMsg, type DeckResumo, type MsgCliente, type MsgServidor, type RespostaRelato } from './protocolo.ts';
import { conferirPedido, LIMITE_CORPO_RELATO, numeroCurto, Relatos } from './relatos.ts';
import { Gerente, type Conexao } from './salas.ts';

// os erros e avisos do servidor ficam guardados em memória para irem junto dos relatos de erro
instalarDiario();

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
// relatos de erro (botão "Reportar erro"): uma pasta por relato; leia com node ferramentas/relatos.ts
const relatos = new Relatos(process.env.RELATOS ?? join(DADOS, 'relatos'));
const INICIADO_EM = new Date().toISOString();
/** a versão do código que está rodando (o commit), para o relato dizer com qual versão o erro aconteceu */
const VERSAO = (() => {
  try { return execFileSync('git', ['log', '-1', '--format=%h %cI %s'], { cwd: RAIZ, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
})();

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
const imagens = new Imagens(join(RAIZ, '..', 'cartas'), join(RAIZ, '.cache', 'miniaturas'), undefined, [pastas.imagens, join(RAIZ, 'proprias', 'imagens')]);
const INFO = JSON.stringify(infoCartas());
const resumir = (decks: DeckList[]): DeckResumo[] => { const origens = catalogo.origens(); return decks.map((d) => {
  // parceiros (CR 702.124c): a identidade de cor é a dos dois; sem comandante, a das cartas do deck
  const cores = new Set(d.comandante
    ? [...oracle(d.comandante).colorIdentity, ...(d.parceiro ? oracle(d.parceiro).colorIdentity : [])]
    : d.cartas.flatMap((e) => oracle(e.nome).colorIdentity));
  const basico = (n: string) => { const f = oracle(n).faces[0]; return f.supertypes.includes('Basic') && f.types.includes('Land'); };
  return {
    id: d.id, nome: d.nome, formato: modoDe(d), comandante: d.comandante ?? null, parceiro: d.parceiro ?? null,
    capa: capaDe(d, basico) ?? '', total: d.cartas.reduce((n, e) => n + e.quantidade, 0) + (d.comandante ? 1 : 0) + (d.parceiro ? 1 : 0),
    cores: ['W', 'U', 'B', 'R', 'G'].filter((c) => cores.has(c as never)), origem: origens.get(d.id),
  };
}); };
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
    anunciar({ t: 'catalogo', tarefa: null, mudou: true });
  },
  aoAndamento: (t) => anunciar({ t: 'catalogo', tarefa: t, mudou: false }),
});
const rotasCatalogo = new RotasCatalogo({ catalogo, tarefas, info: infoDoDisco(pastas.gerado), pronta: cartaPronta, banidas: lerBanidas(pastas.dados) });

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
/** relatos por endereço na última hora (um botão que alguém aperta sem parar não enche o disco) */
const relatosPorIp = new Map<string, number[]>();
function muitosRelatos(ip: string): boolean {
  const agora = Date.now();
  const l = (relatosPorIp.get(ip) ?? []).filter((t) => agora - t < 3_600_000);
  l.push(agora);
  relatosPorIp.set(ip, l);
  return l.length > 30;
}
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
arquivos.prepararTexto(INFO);
const arquivo = (req: IncomingMessage, res: ServerResponse, caminho: string, cache: string) => arquivos.arquivo(req, res, caminho, cache);

async function lerCorpo(req: IncomingMessage, limite = 4096): Promise<string> {
  let s = '';
  for await (const parte of req) {
    s += parte;
    if (s.length > limite) throw new Error('corpo grande demais');
  }
  return s;
}

/** o corpo inteiro em bytes, decodificado uma vez no fim (juntar os pedaços como texto partia letras acentuadas que
 * caíam na divisa entre dois pedaços, o que num relato grande, com imagens, acontece) */
async function lerBytes(req: IncomingMessage, limite: number): Promise<string> {
  const partes: Buffer[] = [];
  let n = 0;
  for await (const parte of req as AsyncIterable<Buffer>) {
    n += parte.length;
    if (n > limite) throw new Error('corpo grande demais');
    partes.push(parte);
  }
  return Buffer.concat(partes).toString('utf8');
}

/** POST /api/relatos: grava o relato de erro, com a partida da sala de quem relata (se o token do assento conferir) */
async function receberRelato(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const responder = (status: number, r: RespostaRelato) => json(res, status, r);
  const ip = ipDe(req);
  if (muitosRelatos(ip)) return responder(429, { ok: false, erro: 'Muitos relatos seguidos; espere um pouco' });
  let bruto: unknown;
  try { bruto = JSON.parse(await lerBytes(req, LIMITE_CORPO_RELATO)); } catch (e) {
    return responder(e instanceof Error && /grande/.test(e.message) ? 413 : 400, { ok: false, erro: e instanceof Error && /grande/.test(e.message) ? 'O relato ficou grande demais (tire algumas imagens)' : 'Pedido inválido' });
  }
  const c = conferirPedido(bruto);
  if ('erro' in c) return responder(400, { ok: false, erro: c.erro });
  const { pedido, imagens } = c;
  let partida: Record<string, unknown> | null = null;
  let ausente: string | null = null;
  if (pedido.anexarPartida && pedido.sala) {
    try {
      partida = gerente.paraRelato(pedido.sala.codigo, pedido.sala.token);
      if (!partida) ausente = 'a sala ou o assento não conferem (sala encerrada ou outra pessoa no lugar)';
    } catch (e) {
      ausente = `erro ao juntar a partida: ${e instanceof Error ? e.message : String(e)}`;
      console.error('relato: partida', e);
    }
  } else if (pedido.anexarPartida) ausente = 'a pessoa não estava numa sala';
  const servidor = {
    versao: VERSAO, iniciadoEm: INICIADO_EM, node: process.version, plataforma: process.platform,
    memoriaMB: Math.round(process.memoryUsage().rss / 1048576), salas: gerente.salas.size, decks: resumoDecks.length,
    // as linhas da última hora (o erro costuma estar aqui)
    diario: diarioRecente(),
  };
  const id = relatos.gravar(pedido, imagens, partida, ausente, servidor);
  console.log(`Relato de erro ${numeroCurto(id)} recebido (${id}${pedido.nome ? `, de ${pedido.nome}` : ''}): node ferramentas/relatos.ts ver ${numeroCurto(id)}`);
  return responder(200, { ok: true, id });
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
  if (p === '/api/relatos' && req.method === 'POST') return receberRelato(req, res);
  // as informações das cartas (centenas de KB): o navegador revalida pelo ETag e só baixa de novo quando mudam
  if (p === '/api/cartas') return arquivos.texto(req, res, INFO, 'application/json; charset=utf-8', 'private, no-cache');
  if (p === '/api/catalogo' || p.startsWith('/api/catalogo/')) {
    let corpo = '';
    if (req.method === 'POST') {
      // um deck montado na mesa traz a lista inteira (100 cartas)
      try { corpo = await lerCorpo(req, 32768); } catch { return json(res, 413, { erro: 'Pedido grande demais' }); }
    }
    const gravacao = rotasCatalogo.gravacao(req.method ?? 'GET', p, corpo);
    const r = gravacao ? await gravacao : rotasCatalogo.tratar(req.method ?? 'GET', p, corpo, ipDe(req));
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
