// Arquivos e textos grandes pelo HTTP: ETag (o navegador revalida e recebe 304 sem o corpo), compressão brotli ou gzip
// calculada uma vez e guardada na memória (o cliente compilado, as informações das cartas), e pedidos de intervalo
// (Range: o Safari só toca o mp3 da música assim).

import { createHash } from 'node:crypto';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname } from 'node:path';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';

const brotli = promisify(brotliCompress);
const gz = promisify(gzip);

export const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.txt': 'text/plain; charset=utf-8',
};

/** tipos que valem a pena comprimir (imagens, fontes e áudio já vêm comprimidos) */
const COMPRIMIVEIS = new Set(['.html', '.js', '.css', '.svg', '.json', '.txt']);
/** abaixo disto, comprimir não compensa */
const MINIMO = 1024;

interface Comprimido { chave: string; br: Buffer | null; gz: Buffer | null }

/** a escolha do navegador, pela ordem de preferência do servidor: brotli, depois gzip */
function codificacao(req: IncomingMessage): 'br' | 'gzip' | null {
  const a = String(req.headers['accept-encoding'] ?? '');
  if (/\bbr\b/.test(a)) return 'br';
  if (/\bgzip\b/.test(a)) return 'gzip';
  return null;
}

/** o pedido já tem esta versão (If-None-Match) */
function naoMudou(req: IncomingMessage, etag: string): boolean {
  const h = req.headers['if-none-match'];
  return !!h && h.split(',').some((x) => x.trim() === etag || x.trim() === '*');
}

export class Arquivos {
  /** versões comprimidas, pela chave do conteúdo (caminho + tamanho + data, ou o hash do texto) */
  private cache = new Map<string, Comprimido>();
  private calculando = new Map<string, Promise<Comprimido>>();

  /** comprime (uma vez por versão) e guarda; os pedidos que chegam enquanto calcula esperam o mesmo cálculo */
  private comprimir(chave: string, ler: () => Buffer | string): Promise<Comprimido> {
    const pronto = this.cache.get(chave);
    if (pronto) return Promise.resolve(pronto);
    let p = this.calculando.get(chave);
    if (!p) {
      p = (async () => {
        const dados = ler();
        const [br, g] = await Promise.all([
          brotli(dados, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: Buffer.byteLength(dados) } }),
          gz(dados, { level: 9 }),
        ]);
        const c: Comprimido = { chave, br, gz: g };
        // a versão nova de um arquivo substitui a velha (a chave começa pelo caminho)
        const prefixo = chave.slice(0, chave.indexOf('|') + 1);
        if (prefixo) for (const k of this.cache.keys()) if (k.startsWith(prefixo)) this.cache.delete(k);
        this.cache.set(chave, c);
        return c;
      })().finally(() => this.calculando.delete(chave));
      this.calculando.set(chave, p);
    }
    return p;
  }

  /** calcula de antemão as versões comprimidas de um arquivo (o cliente compilado, ao subir o servidor) */
  preparar(caminho: string): void {
    const tipo = extname(caminho);
    if (!COMPRIMIVEIS.has(tipo)) return;
    try {
      const st = statSync(caminho);
      if (st.size < MINIMO) return;
      void this.comprimir(`${caminho}|${st.size}|${st.mtimeMs}`, () => readFileSync(caminho)).catch(() => {});
    } catch { /* sumiu: fica para o pedido */ }
  }

  /** manda um arquivo do disco com ETag, compressão e intervalo */
  async arquivo(req: IncomingMessage, res: ServerResponse, caminho: string, cache: string): Promise<void> {
    const st = statSync(caminho);
    const tipo = extname(caminho);
    const etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    const cab: Record<string, string | number> = { 'content-type': TIPOS[tipo] ?? 'application/octet-stream', 'cache-control': cache, etag, 'accept-ranges': 'bytes' };
    if (naoMudou(req, etag)) { res.writeHead(304, cab); res.end(); return; }
    // intervalo pedido (áudio no Safari): sai o pedaço, sem compressão
    const intervalo = this.intervalo(req, st.size);
    if (intervalo === 'invalido') { res.writeHead(416, { ...cab, 'content-range': `bytes */${st.size}` }); res.end(); return; }
    if (intervalo) {
      const [ini, fim] = intervalo;
      res.writeHead(206, { ...cab, 'content-range': `bytes ${ini}-${fim}/${st.size}`, 'content-length': fim - ini + 1 });
      if (req.method === 'HEAD') { res.end(); return; }
      pipeline(createReadStream(caminho, { start: ini, end: fim }), res, erroDeLeitura(caminho));
      return;
    }
    const cod = COMPRIMIVEIS.has(tipo) && st.size >= MINIMO ? codificacao(req) : null;
    if (cod) {
      const c = await this.comprimir(`${caminho}|${st.size}|${st.mtimeMs}`, () => readFileSync(caminho));
      const corpo = cod === 'br' ? c.br : c.gz;
      if (corpo) {
        res.writeHead(200, { ...cab, 'content-encoding': cod, 'content-length': corpo.length, vary: 'accept-encoding' });
        res.end(req.method === 'HEAD' ? undefined : corpo);
        return;
      }
    }
    res.writeHead(200, { ...cab, 'content-length': st.size, ...(COMPRIMIVEIS.has(tipo) ? { vary: 'accept-encoding' } : {}) });
    if (req.method === 'HEAD') { res.end(); return; }
    pipeline(createReadStream(caminho), res, erroDeLeitura(caminho));
  }

  /** manda um texto gerado pelo servidor (as informações das cartas) com ETag pelo conteúdo e compressão */
  async texto(req: IncomingMessage, res: ServerResponse, texto: string, tipo: string, cache: string): Promise<void> {
    const hash = createHash('sha256').update(texto).digest('base64url').slice(0, 16);
    const etag = `"${hash}"`;
    const cab = { 'content-type': tipo, 'cache-control': cache, etag, vary: 'accept-encoding' };
    if (naoMudou(req, etag)) { res.writeHead(304, cab); res.end(); return; }
    const cod = Buffer.byteLength(texto) >= MINIMO ? codificacao(req) : null;
    if (cod) {
      const c = await this.comprimir(`texto:${hash}`, () => texto);
      const corpo = cod === 'br' ? c.br : c.gz;
      if (corpo) { res.writeHead(200, { ...cab, 'content-encoding': cod, 'content-length': corpo.length }); res.end(corpo); return; }
    }
    res.writeHead(200, { ...cab, 'content-length': Buffer.byteLength(texto) });
    res.end(texto);
  }

  /** o intervalo de bytes pedido (só um: "bytes=ini-fim", "bytes=ini-" ou "bytes=-n"), null sem pedido */
  private intervalo(req: IncomingMessage, tamanho: number): [number, number] | null | 'invalido' {
    const h = req.headers.range;
    if (!h) return null;
    const m = /^bytes=(\d*)-(\d*)$/.exec(h.trim());
    if (!m || (m[1] === '' && m[2] === '')) return null; // vários intervalos ou formato que não entendemos: o arquivo inteiro
    let ini: number, fim: number;
    if (m[1] === '') { ini = Math.max(0, tamanho - Number(m[2])); fim = tamanho - 1; } else { ini = Number(m[1]); fim = m[2] === '' ? tamanho - 1 : Math.min(Number(m[2]), tamanho - 1); }
    if (ini > fim || ini >= tamanho) return 'invalido';
    return [ini, fim];
  }
}

/** erro de leitura no meio (arquivo apagado ou trocado): corta só esta resposta */
function erroDeLeitura(caminho: string) {
  return (e: NodeJS.ErrnoException | null) => { if (e && e.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error(`arquivo ${caminho}:`, e.message); };
}
