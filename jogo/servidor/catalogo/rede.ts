// Pedidos ao Moxfield e ao Scryfall. Os testes usam uma Rede falsa (nada de internet na suíte).
//
// Boas maneiras com as duas APIs: User-Agent e Accept próprios, um pedido por vez para cada servidor, com um
// intervalo entre eles; 429 espera o Retry-After. Se o Moxfield recusar (401/403 ou uma página de bloqueio no
// lugar do JSON), a importação para e diz o motivo: nenhum bloqueio é contornado.
//
// O transporte é o node:https, com os cabeçalhos que escrevemos aqui. O fetch do Node manda cabeçalhos próprios de
// navegador (sec-fetch-mode e outros) junto com um User-Agent que não é de navegador, e a proteção do Moxfield
// recusa essa mistura; o mesmo pedido honesto pelo curl, pelo Python (o coletor) ou pelo node:https é aceito.

import { request } from 'node:https';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

export type TipoErroRede = 'bloqueado' | 'nao-encontrado' | 'nao-json' | 'http' | 'rede' | 'grande';

export class ErroRede extends Error {
  tipo: TipoErroRede;
  status: number | null;
  url: string;
  constructor(tipo: TipoErroRede, url: string, status: number | null, msg: string) {
    super(msg);
    this.tipo = tipo;
    this.url = url;
    this.status = status;
  }
}

export interface Rede {
  json<T>(url: string, o?: { metodo?: 'GET' | 'POST'; corpo?: unknown }): Promise<T>;
  binario(url: string): Promise<Buffer>;
}

export interface RespostaBruta { status: number; headers: Record<string, string>; corpo: Buffer }
export type Transporte = (url: string, o: { metodo: 'GET' | 'POST'; headers: Record<string, string>; corpo?: string; prazoMs: number }) => Promise<RespostaBruta>;

/** só ASCII: com acento no cabeçalho o Scryfall responde 403 */
export const USER_AGENT = 'CommanderDaMesa/1.0 (jogo privado de Commander entre amigos; importacao de decks)';
/** teto do tamanho de uma resposta (o maior deck do Moxfield tem perto de 1 MB; uma imagem png, 1,5 MB) */
const TETO = 16 * 1024 * 1024;

/** intervalo mínimo entre dois pedidos ao mesmo servidor, em ms */
function intervalo(url: URL): number {
  if (url.hostname.endsWith('moxfield.com')) return 350;
  if (url.hostname === 'api.scryfall.com') return /^\/cards\/(search|collection)/.test(url.pathname) ? 500 : 120;
  return 60; // imagens (cards.scryfall.io)
}

/** um pedido HTTPS, com a resposta descompactada e um teto de tamanho */
export const transporteHttps: Transporte = (url, o) => new Promise((ok, falha) => {
  const corpo = o.corpo !== undefined ? Buffer.from(o.corpo) : null;
  const req = request(url, {
    method: o.metodo,
    headers: { ...o.headers, 'Accept-Encoding': 'gzip, deflate, br', ...(corpo ? { 'Content-Length': String(corpo.length) } : {}) },
    timeout: o.prazoMs,
  }, (res) => {
    const partes: Buffer[] = [];
    let tam = 0;
    res.on('data', (b: Buffer) => {
      tam += b.length;
      if (tam > TETO) { req.destroy(new ErroRede('grande', url, res.statusCode ?? null, 'Resposta grande demais')); return; }
      partes.push(b);
    });
    res.on('end', () => {
      try {
        let b = Buffer.concat(partes);
        const enc = String(res.headers['content-encoding'] ?? '');
        if (enc.includes('gzip')) b = gunzipSync(b);
        else if (enc.includes('br')) b = brotliDecompressSync(b);
        else if (enc.includes('deflate')) b = inflateSync(b);
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
        ok({ status: res.statusCode ?? 0, headers, corpo: b });
      } catch (e) {
        falha(e);
      }
    });
    res.on('error', falha);
  });
  req.on('timeout', () => req.destroy(new Error('sem resposta no prazo')));
  req.on('error', falha);
  if (corpo) req.write(corpo);
  req.end();
});

export interface OpcoesRede {
  /** troca o relógio de espera (testes) */
  esperar?: (ms: number) => Promise<void>;
  transporte?: Transporte;
  prazoMs?: number;
}

export function redeReal(o: OpcoesRede = {}): Rede {
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((ok) => setTimeout(ok, ms)));
  const transporte = o.transporte ?? transporteHttps;
  const prazo = o.prazoMs ?? 30_000;
  const ultimo = new Map<string, number>();
  // um pedido por vez para cada servidor: a fila guarda a promessa do anterior
  const filas = new Map<string, Promise<unknown>>();

  async function pedir(url: string, accept: string, metodo: 'GET' | 'POST', corpo?: unknown): Promise<RespostaBruta> {
    for (let tentativa = 0, redirecoes = 0; ;) {
      const u = new URL(url);
      if (u.protocol !== 'https:') throw new ErroRede('rede', url, null, `Endereço recusado: ${url}`);
      const falta = (ultimo.get(u.host) ?? 0) + intervalo(u) - Date.now();
      if (falta > 0) await esperar(falta);
      ultimo.set(u.host, Date.now());
      let r: RespostaBruta;
      try {
        r = await transporte(url, {
          metodo,
          headers: { 'User-Agent': USER_AGENT, Accept: accept, ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}) },
          corpo: corpo !== undefined ? JSON.stringify(corpo) : undefined,
          prazoMs: prazo,
        });
      } catch (e) {
        if (e instanceof ErroRede) throw e;
        if (tentativa++ < 2) { await esperar(2000 * tentativa); continue; }
        throw new ErroRede('rede', url, null, `Sem resposta de ${u.host}: ${e instanceof Error ? e.message : String(e)}`);
      }
      if ([301, 302, 303, 307, 308].includes(r.status) && r.headers.location && redirecoes++ < 3) {
        url = new URL(r.headers.location, url).toString();
        continue;
      }
      if (r.status === 429 || r.status >= 500) {
        if (tentativa++ < 3) {
          const ra = Number(r.headers['retry-after']);
          await esperar(Math.min(60_000, Number.isFinite(ra) && ra > 0 ? ra * 1000 : 2000 * 2 ** (tentativa - 1)));
          continue;
        }
        throw new ErroRede('http', url, r.status, `${u.host} respondeu ${r.status} várias vezes; tente de novo mais tarde`);
      }
      if (r.status === 401 || r.status === 403) throw new ErroRede('bloqueado', url, r.status, `${u.host} recusou o acesso (HTTP ${r.status})`);
      if (r.status === 404) throw new ErroRede('nao-encontrado', url, 404, `Não encontrado: ${url}`);
      if (r.status < 200 || r.status >= 300) throw new ErroRede('http', url, r.status, `${u.host} respondeu ${r.status}`);
      return r;
    }
  }

  function emFila<T>(url: string, f: () => Promise<T>): Promise<T> {
    const host = new URL(url).host;
    const antes = filas.get(host) ?? Promise.resolve();
    const p = antes.then(f, f);
    filas.set(host, p.catch(() => undefined));
    return p;
  }

  return {
    json<T>(url: string, op: { metodo?: 'GET' | 'POST'; corpo?: unknown } = {}): Promise<T> {
      return emFila(url, async () => {
        const r = await pedir(url, 'application/json;q=0.9,*/*;q=0.8', op.metodo ?? 'GET', op.corpo);
        const texto = r.corpo.toString('utf8');
        try {
          if (!(r.headers['content-type'] ?? '').includes('json') && !/^\s*[[{]/.test(texto)) throw new Error('não é JSON');
          return JSON.parse(texto) as T;
        } catch {
          throw new ErroRede('nao-json', url, r.status, `${new URL(url).host} respondeu algo que não é JSON (pode ser uma página de bloqueio)`);
        }
      });
    },
    binario(url: string): Promise<Buffer> {
      return emFila(url, async () => (await pedir(url, 'image/png,image/*;q=0.8,*/*;q=0.5', 'GET')).corpo);
    },
  };
}
