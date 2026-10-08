// Rede real com um transporte falso: intervalo entre pedidos ao mesmo servidor, Retry-After, recusas e respostas
// que não são JSON.
import { describe, expect, it } from 'vitest';
import { ErroRede, redeReal, USER_AGENT, type RespostaBruta, type Transporte } from '../../servidor/catalogo/rede.ts';

function transporte(respostas: Record<string, RespostaBruta[]>) {
  const pedidos: { url: string; headers: Record<string, string>; corpo?: string; quando: number }[] = [];
  const t: Transporte = async (url, o) => {
    pedidos.push({ url, headers: o.headers, corpo: o.corpo, quando: Date.now() });
    const fila = respostas[url];
    if (!fila?.length) throw new Error(`sem resposta para ${url}`);
    return fila.length > 1 ? fila.shift()! : fila[0];
  };
  return { t, pedidos };
}
const json = (v: unknown, status = 200, headers: Record<string, string> = {}): RespostaBruta => ({ status, headers: { 'content-type': 'application/json', ...headers }, corpo: Buffer.from(JSON.stringify(v)) });

describe('rede', () => {
  it('User-Agent só em ASCII, Accept e corpo JSON no POST', async () => {
    const { t, pedidos } = transporte({ 'https://api.scryfall.com/cards/collection': [json({ data: [] })] });
    const rede = redeReal({ transporte: t, esperar: async () => {} });
    await rede.json('https://api.scryfall.com/cards/collection', { metodo: 'POST', corpo: { identifiers: [] } });
    expect(/^[\x20-\x7e]+$/.test(USER_AGENT)).toBe(true);
    expect(pedidos[0].headers['User-Agent']).toBe(USER_AGENT);
    expect(pedidos[0].headers.Accept).toMatch(/application\/json/);
    expect(pedidos[0].headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(pedidos[0].corpo!)).toEqual({ identifiers: [] });
  });

  it('espera entre dois pedidos ao mesmo servidor (Scryfall: 120 ms; busca: 500 ms; Moxfield: 350 ms)', async () => {
    const esperas: number[] = [];
    const { t } = transporte({
      'https://api.scryfall.com/cards/x': [json({})],
      'https://api.scryfall.com/cards/search?q=a': [json({})],
      'https://api2.moxfield.com/v3/decks/all/abc': [json({})],
    });
    const rede = redeReal({ transporte: t, esperar: async (ms) => { esperas.push(ms); } });
    await rede.json('https://api.scryfall.com/cards/x');
    await rede.json('https://api.scryfall.com/cards/x');
    await rede.json('https://api.scryfall.com/cards/search?q=a');
    await rede.json('https://api2.moxfield.com/v3/decks/all/abc');
    expect(esperas).toHaveLength(2);
    expect(esperas[0]).toBeGreaterThan(100);
    expect(esperas[0]).toBeLessThanOrEqual(120);
    expect(esperas[1]).toBeGreaterThan(450);
  });

  it('429 espera o Retry-After e tenta de novo; 403 para sem tentar de novo', async () => {
    const esperas: number[] = [];
    const { t, pedidos } = transporte({
      'https://api.scryfall.com/a': [json({ erro: 1 }, 429, { 'retry-after': '3' }), json({ ok: true })],
      'https://api2.moxfield.com/b': [{ status: 403, headers: { 'content-type': 'text/html' }, corpo: Buffer.from('<html>') }],
    });
    const rede = redeReal({ transporte: t, esperar: async (ms) => { esperas.push(ms); } });
    expect(await rede.json('https://api.scryfall.com/a')).toEqual({ ok: true });
    expect(esperas).toContain(3000);
    await expect(rede.json('https://api2.moxfield.com/b')).rejects.toMatchObject({ tipo: 'bloqueado', status: 403 });
    expect(pedidos.filter((p) => p.url.endsWith('/b'))).toHaveLength(1);
  });

  it('404, página HTML no lugar do JSON, erro do servidor repetido e endereço sem https', async () => {
    const { t } = transporte({
      'https://api.scryfall.com/n': [json({}, 404)],
      'https://api2.moxfield.com/h': [{ status: 200, headers: { 'content-type': 'text/html' }, corpo: Buffer.from('<!DOCTYPE html><p>Just a moment') }],
      'https://api.scryfall.com/e': [json({}, 503)],
    });
    const rede = redeReal({ transporte: t, esperar: async () => {} });
    await expect(rede.json('https://api.scryfall.com/n')).rejects.toMatchObject({ tipo: 'nao-encontrado' });
    await expect(rede.json('https://api2.moxfield.com/h')).rejects.toMatchObject({ tipo: 'nao-json' });
    await expect(rede.json('https://api.scryfall.com/e')).rejects.toMatchObject({ tipo: 'http', status: 503 });
    await expect(rede.json('http://api.scryfall.com/x')).rejects.toBeInstanceOf(ErroRede);
  });

  it('segue redirecionamento e devolve o binário', async () => {
    const { t } = transporte({
      'https://cards.scryfall.io/a.png': [{ status: 302, headers: { location: 'https://cards.scryfall.io/b.png' }, corpo: Buffer.alloc(0) }],
      'https://cards.scryfall.io/b.png': [{ status: 200, headers: { 'content-type': 'image/png' }, corpo: Buffer.from([1, 2, 3]) }],
    });
    const rede = redeReal({ transporte: t, esperar: async () => {} });
    expect([...(await rede.binario('https://cards.scryfall.io/a.png'))]).toEqual([1, 2, 3]);
  });
});
