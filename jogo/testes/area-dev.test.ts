// Área do desenvolvedor: só entra quem tem a chave própria, e por padrão só deste computador (pelo túnel ela responde
// como se não existisse); a senha do grupo não abre; erros do navegador chegam e se agrupam; relatos são lidos e
// marcados pela área. Sobe o servidor de verdade numa porta livre, com uma pasta de dados temporária.

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assinatura } from '../servidor/dev/erros-cliente.ts';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHAVE = 'chave-do-dev-de-teste-com-tamanho-bom';

function portaLivre(): Promise<number> {
  return new Promise((ok) => { const s = createServer(); s.listen(0, () => { const p = (s.address() as { port: number }).port; s.close(() => ok(p)); }); });
}

describe('assinatura dos erros do navegador', () => {
  it('ignora hash do arquivo compilado, linha/coluna e números da mensagem', () => {
    const a = assinatura({ tipo: 'erro', texto: 'TypeError: objeto 12 sem dono', pilha: 'TypeError: objeto 12 sem dono\n    at Mesa (http://localhost:8080/assets/index-AbC123xY.js:1:2345)\n    at x (http://localhost:8080/assets/index-AbC123xY.js:9:87)' });
    const b = assinatura({ tipo: 'erro', texto: 'TypeError: objeto 99 sem dono', pilha: 'TypeError: objeto 99 sem dono\n    at Mesa (https://abc.trycloudflare.com/assets/index-ZZZ999qq.js:1:2399)\n    at x (https://abc.trycloudflare.com/assets/index-ZZZ999qq.js:9:80)' });
    const c = assinatura({ tipo: 'erro', texto: 'TypeError: outra coisa', pilha: '' });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('área do desenvolvedor (servidor de verdade)', () => {
  let proc: ChildProcess;
  let dados: string;
  let porta: number;
  let saida = '';
  let jogador = '';
  let dev = '';
  const url = (p: string) => `http://127.0.0.1:${porta}${p}`;
  const pedir = (p: string, o: { cookie?: string; corpo?: unknown; cab?: Record<string, string> } = {}) => fetch(url(p), {
    method: o.corpo === undefined ? 'GET' : 'POST',
    headers: { ...(o.cookie ? { cookie: o.cookie } : {}), ...(o.corpo === undefined ? {} : { 'content-type': 'application/json' }), ...o.cab },
    body: o.corpo === undefined ? undefined : JSON.stringify(o.corpo),
  });
  const ambos = () => `${jogador}; ${dev}`;

  beforeAll(async () => {
    porta = await portaLivre();
    dados = mkdtempSync(join(tmpdir(), 'area-dev-'));
    const estaticos = join(dados, 'dist');
    mkdirSync(estaticos, { recursive: true });
    writeFileSync(join(estaticos, 'index.html'), '<!doctype html><title>t</title><div id="app"></div>');
    // um relato já gravado, como o servidor grava
    const id = '20261112-213005-k3f9';
    mkdirSync(join(dados, 'relatos', id), { recursive: true });
    writeFileSync(join(dados, 'relatos', id, '01-tela.png'), Buffer.from('89504e470d0a1a0a', 'hex'));
    writeFileSync(join(dados, 'relatos', id, 'relato.json'), JSON.stringify({
      id, em: '2026-11-12T21:30:05.000Z', estado: 'aberto', resolucao: null, tipo: 'regra', oque: 'O Counterspell não anulou', esperado: '', passos: '', repete: 'sempre',
      cartas: ['Counterspell'], nome: 'Ana', imagens: [{ arquivo: '01-tela.png', origem: 'tela', bytes: 8 }], partida: false, contexto: { tela: 'sala' }, servidor: { versao: 'abc1234 x y' },
    }));
    proc = spawn(process.execPath, ['servidor/index.ts'], { cwd: RAIZ, env: { ...process.env, PORTA: String(porta), DADOS: dados, SENHA_ACESSO: 'senha-do-grupo', SENHA_DEV: CHAVE, DEV_REMOTO: '', HTTPS: '', ESTATICOS: estaticos } });
    proc.stdout!.on('data', (d) => { saida += String(d); });
    proc.stderr!.on('data', (d) => { saida += String(d); });
    const fim = Date.now() + 90000;
    while (!saida.includes('Magic Commander: http://localhost:')) {
      if (proc.exitCode !== null || Date.now() > fim) throw new Error(`o servidor não subiu:\n${saida}`);
      await new Promise((r) => setTimeout(r, 100));
    }
    const r = await pedir('/api/entrar', { corpo: { senha: 'senha-do-grupo' } });
    jogador = (r.headers.get('set-cookie') ?? '').split(';')[0];
    expect(jogador).toMatch(/^sessao=/);
  }, 120000);

  afterAll(async () => {
    if (proc && proc.exitCode === null) { proc.kill(); await new Promise((r) => proc.once('exit', r)); }
    if (dados) rmSync(dados, { recursive: true, force: true });
  });

  it('sem a sessão do desenvolvedor nada abre, nem com a senha do grupo', async () => {
    expect((await (await pedir('/api/dev/sessao')).json()).ok).toBe(false);
    expect((await pedir('/api/dev/resumo')).status).toBe(401);
    expect((await pedir('/api/dev/relatos', { cookie: jogador })).status).toBe(401);
    expect((await pedir('/api/dev/entrar', { corpo: { chave: 'senha-do-grupo' } })).status).toBe(401);
  });

  it('a chave certa abre uma sessão própria (HttpOnly, SameSite=Strict)', async () => {
    const r = await pedir('/api/dev/entrar', { corpo: { chave: CHAVE } });
    expect(r.status).toBe(200);
    const c = r.headers.get('set-cookie') ?? '';
    expect(c).toMatch(/^dev=[\w-]{40,};/);
    expect(c).toMatch(/HttpOnly/);
    expect(c).toMatch(/SameSite=Strict/);
    dev = c.split(';')[0];
    expect((await (await pedir('/api/dev/sessao', { cookie: dev })).json()).ok).toBe(true);
    const resumo = await (await pedir('/api/dev/resumo', { cookie: dev })).json();
    expect(resumo.relatos.abertos).toBe(1);
    expect(typeof resumo.memoria.rssMB).toBe('number');
  }, 20000);

  it('pelo túnel (com cf-connecting-ip) a área responde 404, mesmo com a sessão', async () => {
    const tunel = { 'cf-connecting-ip': '200.1.2.3' };
    expect((await pedir('/api/dev/resumo', { cookie: dev, cab: tunel })).status).toBe(404);
    expect((await pedir('/api/dev/entrar', { corpo: { chave: CHAVE }, cab: tunel })).status).toBe(404);
    expect((await pedir('/dev', { cookie: ambos(), cab: tunel })).status).toBe(404);
    expect((await pedir('/dev', { cab: {} })).status).toBe(200);
  });

  it('POST vindo de outra página é recusado', async () => {
    const r = await pedir('/api/dev/relatos/20261112-213005-k3f9/estado', { cookie: dev, corpo: { estado: 'resolvido' }, cab: { origin: 'https://malvado.example' } });
    expect(r.status).toBe(403);
  });

  it('relatos: lista, detalhe, imagem e resolver/reabrir', async () => {
    const lista = await (await pedir('/api/dev/relatos', { cookie: dev })).json();
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ numero: 'K3F9', tipo: 'regra', nome: 'Ana', imagens: ['01-tela.png'] });
    const d = await (await pedir('/api/dev/relatos/20261112-213005-k3f9', { cookie: dev })).json();
    expect(d.relato.oque).toBe('O Counterspell não anulou');
    expect(d.arquivos.map((a: { nome: string }) => a.nome)).toContain('01-tela.png');
    const img = await pedir('/api/dev/relatos/20261112-213005-k3f9/arquivo/01-tela.png', { cookie: dev });
    expect(img.status).toBe(200);
    expect(img.headers.get('content-type')).toBe('image/png');
    expect((await pedir('/api/dev/relatos/20261112-213005-k3f9/arquivo/..%2Frelato.json', { cookie: dev })).status).toBe(404);
    expect((await pedir('/api/dev/relatos/20261112-213005-k3f9/arquivo/01-tela.png')).status).toBe(401);
    expect((await pedir('/api/dev/relatos/20261112-213005-k3f9/estado', { cookie: dev, corpo: { estado: 'resolvido', nota: 'corrigido no abc' } })).status).toBe(200);
    const gravado = JSON.parse(readFileSync(join(dados, 'relatos', '20261112-213005-k3f9', 'relato.json'), 'utf8'));
    expect(gravado.estado).toBe('resolvido');
    expect(gravado.resolucao.nota).toBe('corrigido no abc');
    await pedir('/api/dev/relatos/20261112-213005-k3f9/estado', { cookie: dev, corpo: { estado: 'aberto' } });
    expect(JSON.parse(readFileSync(join(dados, 'relatos', '20261112-213005-k3f9', 'relato.json'), 'utf8')).estado).toBe('aberto');
  });

  it('erros do navegador: só com a sessão de jogador, agrupam e reabrem quando voltam', async () => {
    const erro = { tipo: 'erro', texto: 'TypeError: x is undefined', pilha: 'TypeError: x is undefined\n    at Mesa (http://localhost/assets/index-AAAAAAAA.js:1:10)', tela: 'mesa', navegador: 'teste' };
    expect((await pedir('/api/erros-cliente', { corpo: erro })).status).toBe(401);
    expect((await pedir('/api/erros-cliente', { cookie: jogador, corpo: erro })).status).toBe(200);
    expect((await pedir('/api/erros-cliente', { cookie: jogador, corpo: { ...erro, pilha: erro.pilha.replace('AAAAAAAA', 'BBBBBBBB').replace(':1:10', ':1:12') } })).status).toBe(200);
    let l = await (await pedir('/api/dev/erros', { cookie: dev })).json();
    expect(l).toHaveLength(1);
    expect(l[0]).toMatchObject({ vezes: 2, vezes24h: 2, tela: 'mesa', resolvido: false, pessoas: 1 });
    expect((await pedir(`/api/dev/erros/${l[0].assinatura}`, { cookie: dev, corpo: { resolvido: true } })).status).toBe(200);
    l = await (await pedir('/api/dev/erros', { cookie: dev })).json();
    expect(l[0].resolvido).toBe(true);
    await pedir('/api/erros-cliente', { cookie: jogador, corpo: erro });
    l = await (await pedir('/api/dev/erros', { cookie: dev })).json();
    expect(l[0]).toMatchObject({ vezes: 3, resolvido: false });
    expect((await pedir(`/api/dev/erros/${l[0].assinatura}`, { cookie: dev, corpo: { apagar: true } })).status).toBe(200);
    expect(await (await pedir('/api/dev/erros', { cookie: dev })).json()).toHaveLength(0);
  });

  it('diário, salas, decks e acesso respondem', async () => {
    const diario = await (await pedir('/api/dev/diario', { cookie: dev })).json();
    expect(diario.some((l: { texto: string }) => l.texto.includes('Magic Commander: http://localhost:'))).toBe(true);
    expect(Array.isArray(await (await pedir('/api/dev/salas', { cookie: dev })).json())).toBe(true);
    const decks = await (await pedir('/api/dev/decks', { cookie: dev })).json();
    expect(Array.isArray(decks.decks)).toBe(true);
    expect(Array.isArray(decks.cartasFaltando)).toBe(true);
    const acesso = await (await pedir('/api/dev/acesso', { cookie: dev })).json();
    expect(acesso.remoto).toBe(false);
    expect(acesso.sessoes.filter((s: { esta: boolean }) => s.esta)).toHaveLength(1);
    expect(acesso.acessos.some((l: string) => l.includes('ENTROU'))).toBe(true);
  });

  it('chave errada demais bloqueia o endereço; sair derruba a sessão', async () => {
    for (let i = 0; i < 5; i++) expect((await pedir('/api/dev/entrar', { corpo: { chave: `errada-${i}` } })).status).toBe(401);
    expect((await pedir('/api/dev/entrar', { corpo: { chave: CHAVE } })).status).toBe(429);
    expect((await pedir('/api/dev/sair', { cookie: dev, corpo: {} })).status).toBe(200);
    expect((await pedir('/api/dev/resumo', { cookie: dev })).status).toBe(401);
    expect(readFileSync(join(dados, 'dev-acessos.log'), 'utf8')).toMatch(/BLOQUEADO/);
  });
});
