// Robustez e protocolo do servidor, sem rede (conexões falsas e banco em memória):
//  - batimento: `ping` responde `pong` com ou sem sala, sem gravar nada e fora do limite do chat;
//  - todo erro em resposta a uma mensagem diz de que tipo ela era (`de`);
//  - a semente fica no servidor: a sala só mostra um hash curto dela (`partida`);
//  - o servidor de verdade (processo à parte, porta de 8140 a 8149) sobrevive a um frame grande demais.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, idPartida, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}

const espera = () => new Promise((r) => setTimeout(r, 0));

/** banco que conta as gravações de sala */
class BancoContado extends Banco {
  gravacoes = 0;
  override salvarSala(codigo: string, dados: unknown): void { this.gravacoes++; super.salvarSala(codigo, dados); }
}

/** sala 1v1 de Ana (assento 0) com um bot no assento 1 */
function salaComBot(banco: Banco = new Banco(':memory:')) {
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
  return { g, ana, codigo };
}

describe('protocolo: batimento e origem dos erros', () => {
  it('ping responde pong só a quem mandou, antes de entrar numa sala e dentro dela, sem gravar nada', () => {
    const banco = new BancoContado(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const solta = new Falsa();
    g.tratar(solta, { t: 'ping' });
    expect(solta.msgs).toEqual([{ t: 'pong' }]);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo: ana.ultima('sala')!.sala.codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const gravadas = banco.gravacoes;
    const n = bruno.msgs.length;
    // muitos seguidos: nenhum esbarra no limite de ritmo do chat
    for (let i = 0; i < 20; i++) g.tratar(ana, { t: 'ping' });
    expect(ana.msgs.filter((m) => m.t === 'pong')).toHaveLength(20);
    expect(ana.msgs.some((m) => m.t === 'erro')).toBe(false);
    expect(bruno.msgs.length).toBe(n);
    expect(banco.gravacoes).toBe(gravadas);
    // e o chat continua com o limite inteiro
    for (let i = 0; i < 5; i++) g.tratar(ana, { t: 'chat', texto: `oi ${i}` });
    expect(ana.ultima('erro')).toBeUndefined();
  });

  it('o erro diz o tipo da mensagem que o causou', async () => {
    const { g, ana } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const d = ana.ultima('jogo')!.vista.decision!;
    g.tratar(ana, { t: 'responder', decisao: d.id + 5, resposta: { kind: 'mulligan', keep: true } });
    expect(ana.ultima('erro')).toMatchObject({ de: 'responder', msg: expect.stringMatching(/já passou/) });
    g.tratar(ana, { t: 'posicao', obj: 1, x: 7, y: 0 });
    expect(ana.ultima('erro')?.de).toBe('posicao');
    for (let i = 0; i < 6; i++) g.tratar(ana, { t: 'chat', texto: 'oi' });
    expect(ana.ultima('erro')).toMatchObject({ de: 'chat', msg: expect.stringMatching(/Muitas mensagens/) });
    const solta = new Falsa();
    g.tratar(solta, { t: 'conceder' });
    expect(solta.ultima('erro')).toMatchObject({ de: 'conceder', msg: expect.stringMatching(/Entre numa sala/) });
  });
});

describe('condução da partida: erro fora do motor', () => {
  it('uma falha na condução (avancar) vira erro da sala e não escapa como promessa rejeitada', async () => {
    const { g, ana, codigo } = salaComBot();
    const s = g.salas.get(codigo)!;
    const rejeitadas: unknown[] = [];
    const ouvir = (e: unknown) => rejeitadas.push(e);
    process.on('unhandledRejection', ouvir);
    try {
      s.avancar = async () => { throw new Error('falha de teste na condução'); };
      g.tratar(ana, { t: 'mulligan', regra: 'livre' });
      await espera();
      await espera();
      expect(rejeitadas).toEqual([]);
      expect(ana.ultima('erro')?.msg).toMatch(/falha de teste na condução/);
    } finally {
      process.off('unhandledRejection', ouvir);
    }
  });
});

// ---------------------------------------------------------------------------------------------------------------
// o servidor de verdade, num processo à parte
// ---------------------------------------------------------------------------------------------------------------
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** uma porta livre de 8140 a 8149 (as dos testes; a 8080 é a da mesa de verdade) */
async function portaLivre(): Promise<number> {
  for (let p = 8140; p <= 8149; p++) {
    const livre = await new Promise<boolean>((ok) => {
      const s = createServer();
      s.once('error', () => ok(false));
      s.listen(p, () => s.close(() => ok(true)));
    });
    if (livre) return p;
  }
  throw new Error('nenhuma porta livre de 8140 a 8149');
}

/** cliente WebSocket que guarda o que chega */
class Cliente {
  ws: WebSocket;
  msgs: MsgServidor[] = [];
  fechou: number | null = null;
  constructor(url: string, cookie: string) {
    this.ws = new WebSocket(url, { headers: { cookie } });
    this.ws.on('message', (d) => this.msgs.push(JSON.parse(String(d))));
    this.ws.on('close', (codigo) => { this.fechou = codigo; });
    this.ws.on('error', () => {});
  }
  aberto(): Promise<void> { return new Promise((ok, falha) => { this.ws.once('open', () => ok()); this.ws.once('error', falha); }); }
  mandar(m: unknown): void { this.ws.send(typeof m === 'string' ? m : JSON.stringify(m)); }
  /** espera chegar uma mensagem do tipo pedido, depois das `desde` primeiras */
  async esperar<T extends MsgServidor['t']>(t: T, desde = 0, ms = 10000): Promise<Extract<MsgServidor, { t: T }>> {
    const fim = Date.now() + ms;
    for (;;) {
      const m = this.msgs.slice(desde).find((x) => x.t === t);
      if (m) return m as Extract<MsgServidor, { t: T }>;
      if (Date.now() > fim) throw new Error(`não chegou '${t}' (chegaram: ${this.msgs.slice(desde).map((x) => x.t).join(', ')})`);
      await new Promise((r) => setTimeout(r, 20));
    }
  }
  /** batimento: o servidor responde? */
  async vivo(): Promise<boolean> {
    const n = this.msgs.length;
    this.mandar({ t: 'ping' });
    return (await this.esperar('pong', n, 5000)).t === 'pong';
  }
}

describe('servidor de verdade (processo à parte)', () => {
  let proc: ChildProcess;
  let porta = 0;
  let dados = '';
  let cookie = '';
  let saida = '';
  const url = () => `ws://localhost:${porta}/ws`;

  beforeAll(async () => {
    porta = await portaLivre();
    mkdirSync(join(RAIZ, '.cache'), { recursive: true });
    dados = mkdtempSync(join(RAIZ, '.cache', 'teste-robustez-'));
    proc = spawn(process.execPath, ['servidor/index.ts'], { cwd: RAIZ, env: { ...process.env, PORTA: String(porta), DADOS: dados, SENHA_ACESSO: 'senha-do-teste', HTTPS: '' } });
    proc.stdout!.on('data', (d) => { saida += String(d); });
    proc.stderr!.on('data', (d) => { saida += String(d); });
    const fim = Date.now() + 90000;
    while (!saida.includes('Magic Commander: http://localhost:')) {
      if (proc.exitCode !== null || Date.now() > fim) throw new Error(`o servidor não subiu:\n${saida}`);
      await new Promise((r) => setTimeout(r, 100));
    }
    const r = await fetch(`http://localhost:${porta}/api/entrar`, { method: 'POST', body: JSON.stringify({ senha: 'senha-do-teste' }) });
    cookie = (r.headers.get('set-cookie') ?? '').split(';')[0];
    expect(cookie).toMatch(/^sessao=/);
  }, 120000);

  afterAll(async () => {
    if (proc && proc.exitCode === null) {
      proc.kill();
      await new Promise((r) => proc.once('exit', r));
    }
    if (dados) rmSync(dados, { recursive: true, force: true });
  });

  it('um frame maior que o limite fecha só aquela conexão; o servidor continua respondendo', async () => {
    const a = new Cliente(url(), cookie);
    await a.aberto();
    expect(await a.vivo()).toBe(true);
    a.mandar('x'.repeat(70 * 1024));
    const fim = Date.now() + 5000;
    while (a.fechou === null && Date.now() < fim) await new Promise((r) => setTimeout(r, 20));
    expect(a.fechou).toBe(1009); // mensagem grande demais
    const b = new Cliente(url(), cookie);
    await b.aberto();
    expect(await b.vivo()).toBe(true);
    expect(proc.exitCode).toBeNull();
    b.ws.close();
  }, 30000);
});

describe('informação oculta: semente', () => {
  it('a sala mostra só um hash curto da semente; ninguém recebe a semente', async () => {
    const { g, ana, codigo } = salaComBot();
    expect(ana.ultima('sala')!.sala.partida).toBeNull();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const semente = g.salas.get(codigo)!.d.partida!.config.seed;
    const pub = ana.ultima('sala')!.sala;
    expect(pub.partida).toBe(idPartida(semente));
    expect(pub.partida).toMatch(/^[0-9a-f]{12}$/);
    expect('semente' in pub).toBe(false);
    // em nenhuma mensagem, nem pedaço dela (a parte sorteada)
    const sorteada = semente.split('-').slice(2).join('-'); // código-hora-sorteio (o sorteio em base64url pode ter '-')
    expect(sorteada.length).toBeGreaterThanOrEqual(16);
    expect(JSON.stringify(ana.msgs)).not.toContain(sorteada);
  });
});
