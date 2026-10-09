// Robustez e protocolo do servidor, sem rede (conexões falsas e banco em memória):
//  - batimento: `ping` responde `pong` com ou sem sala, sem gravar nada e fora do limite do chat;
//  - todo erro em resposta a uma mensagem diz de que tipo ela era (`de`);
//  - a semente fica no servidor: a sala só mostra um hash curto dela (`partida`);
//  - mensagens sem forma são recusadas ('__proto__' como assento);
//  - erro do motor numa jogada: a sala se refaz sem ela e segue; restaurar refaz até a última entrada boa;
//  - o servidor de verdade (processo à parte, porta de 8140 a 8149) sobrevive a um frame grande demais, e o HTTP dele
//    manda ETag (304), brotli/gzip e intervalos de bytes.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet } from 'node:http';
import { createServer } from 'node:net';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { defaultAnswer } from '../motor/ask.ts';
import { Game, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, idPartida, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  token: string | null = null;
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

describe('validação das mensagens', () => {
  it("'__proto__' e outros assentos fora do intervalo são recusados e a sala continua funcionando", async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const s = g.salas.get(codigo)!;
    for (const assento of ['__proto__', 'constructor', 'length', -1, 4, 1.5, '1', null, undefined, Infinity]) {
      const n = ana.msgs.length;
      g.tratar(ana, { t: 'bot', assento, deck: null } as never);
      expect(ana.msgs.slice(n)).toEqual([{ t: 'erro', msg: 'Mensagem inválida', de: 'bot' }]);
    }
    g.tratar(ana, { t: 'bot', assento: 0, deck: DECKS[1].id } as never);
    expect(ana.ultima('erro')?.msg).toMatch(/não está livre/);
    expect(Array.isArray(s.d.assentos) && Object.getPrototypeOf(s.d.assentos) === Array.prototype).toBe(true);
    expect(s.d.assentos).toHaveLength(4);
    // a sala segue: bots entram, a partida começa
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    for (let i = 1; i < 4; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[i].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(ana.ultima('jogo')?.vista.players).toHaveLength(4);
  });

  it('mensagens sem forma: recusadas com o motivo, sem derrubar nada', async () => {
    const { g, ana } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const d = ana.ultima('jogo')!.vista.decision!;
    const ruins: [unknown, string][] = [
      [null, 'Mensagem inválida'],
      [42, 'Mensagem inválida'],
      [[], 'Mensagem inválida'],
      [{}, 'Mensagem inválida'],
      [{ t: 7 }, 'Mensagem inválida'],
      [{ t: 'constructor' }, 'Mensagem desconhecida'],
      [{ t: '__proto__' }, 'Mensagem desconhecida'],
      [{ t: 'toString' }, 'Mensagem desconhecida'],
      [{ t: 'responder', decisao: d.id, resposta: null }, 'Mensagem inválida'],
      [{ t: 'responder', decisao: d.id, resposta: 'pass' }, 'Mensagem inválida'],
      [{ t: 'responder', decisao: String(d.id), resposta: { kind: 'mulligan', keep: true } }, 'Mensagem inválida'],
      [{ t: 'desfazerResposta', aceitar: 'sim' }, 'Mensagem inválida'],
      [{ t: 'revelar', obj: 1, para: Array(50).fill(1) }, 'Mensagem inválida'],
      [{ t: 'posicao', lista: Array(301).fill({ obj: 1, x: 0, y: 0 }) }, 'Mensagem inválida'],
      [{ t: 'chat', texto: 'x'.repeat(3000) }, 'Mensagem inválida'],
    ];
    for (const [m, msg] of ruins) {
      const n = ana.msgs.length;
      g.tratar(ana, m as never);
      expect(ana.msgs.slice(n).map((x) => (x.t === 'erro' ? x.msg : x.t))).toEqual([msg]);
    }
    // um tipo que não existe não vai no `de`
    expect(ana.msgs.filter((x) => x.t === 'erro' && x.de && !['responder', 'desfazerResposta', 'revelar', 'posicao', 'chat'].includes(x.de))).toEqual([]);
    // a decisão continua lá e a resposta certa passa
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } });
    await espera();
    expect(ana.ultima('jogo')!.vista.decision?.id).not.toBe(d.id);
  });
});

/** o próximo passo do motor nesta partida lança uma exceção (como um erro do motor no meio da jogada) */
function quebrarProximoPasso(game: Game): void {
  const gen = (game as unknown as { gen: Generator }).gen;
  const next = gen.next.bind(gen);
  let feito = false;
  gen.next = (...a: [unknown]) => {
    if (!feito) { feito = true; throw new Error('falha de teste no motor'); }
    return next(...a);
  };
}

/** responde as decisões de Ana com a resposta padrão (a primeira opção que vale) até `n` vezes */
async function jogarAna(g: Gerente, ana: Falsa, n: number) {
  for (let i = 0; i < n; i++) {
    await espera();
    const d = ana.ultima('jogo')?.vista.decision;
    if (!d) return;
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: defaultAnswer(d) });
  }
}

describe('erro do motor: a sala se refaz', () => {
  it('na jogada da pessoa: a jogada não entra, a pessoa recebe o erro como resposta e a decisão volta', async () => {
    const { g, ana, codigo } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const s = g.salas.get(codigo)!;
    const d = ana.ultima('jogo')!.vista.decision!;
    const antes = s.game!;
    const n0 = antes.inputs.length;
    quebrarProximoPasso(antes);
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: defaultAnswer(d) });
    await espera();
    expect(ana.ultima('erro')).toMatchObject({ de: 'responder', msg: expect.stringMatching(/falha de teste no motor.*desfeita/) });
    expect(s.erro).toBeNull();
    expect(s.game).not.toBe(antes);
    expect(s.game!.inputs).toHaveLength(n0);
    expect(ana.ultima('jogo')!.vista.decision?.id).toBe(d.id);
    // e a partida segue
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: defaultAnswer(d) });
    await espera();
    expect(s.game!.inputs.length).toBeGreaterThan(n0);
    expect(ana.ultima('jogo')!.vista.decision?.id).not.toBe(d.id);
  });

  it('na jogada de um bot: a mesa recebe o aviso, o bot responde o padrão e a partida segue', async () => {
    const { g, ana, codigo } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    const s = g.salas.get(codigo)!;
    // a próxima resposta do bot quebra o motor
    const game = s.game!;
    const answer = game.answer.bind(game);
    let quebrou = false;
    game.answer = (p, a) => {
      if (p === 1 && !quebrou) { quebrou = true; quebrarProximoPasso(game); }
      return answer(p, a);
    };
    await jogarAna(g, ana, 40);
    expect(quebrou).toBe(true);
    const erro = ana.msgs.find((m) => m.t === 'erro');
    expect(erro).toMatchObject({ msg: expect.stringMatching(/desfeita/) });
    expect(erro && 'de' in erro).toBe(false);
    expect(s.erro).toBeNull();
    expect(s.game).not.toBe(game);
    expect(s.game!.inputs.some((x) => x.t === 'a' && x.p === 1)).toBe(true);
  }, 60000);

  it('uma resposta automática que quebra sempre: a sala desiste depois de três tentativas, sem laço', async () => {
    const { g, ana, codigo } = salaComBot();
    const original = Game.prototype.answer;
    const espiao = vi.spyOn(Game.prototype, 'answer').mockImplementation(function (this: Game, p, a) {
      if (p === 1) throw new Error('quebra sempre');
      return original.call(this, p, a);
    });
    try {
      g.tratar(ana, { t: 'iniciar' });
      await jogarAna(g, ana, 40);
      const s = g.salas.get(codigo)!;
      expect(s.erro).toMatch(/quebra sempre/);
      const erros = ana.msgs.filter((m) => m.t === 'erro').map((m) => (m as { msg: string }).msg);
      expect(erros.filter((m) => /desfeita/.test(m))).toHaveLength(3);
      expect(erros.at(-1)).toMatch(/salva até a última jogada válida/);
    } finally {
      espiao.mockRestore();
    }
  }, 60000);

  it('restaurar com uma entrada gravada que não vale mais refaz até a última boa', async () => {
    const banco = new Banco(':memory:');
    const { g, ana, codigo } = salaComBot(banco);
    g.tratar(ana, { t: 'iniciar' });
    await jogarAna(g, ana, 8);
    const s = g.salas.get(codigo)!;
    const boas = s.game!.inputs.length;
    expect(boas).toBeGreaterThan(2);
    const ruim: Input = { t: 'a', p: 0, d: 99999, a: { kind: 'priority', action: 'nao-existe' } };
    banco.adicionarEntradas(codigo, boas, [ruim, ruim]);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const s2 = g2.salas.get(codigo)!;
    expect(s2.erro).toBeNull();
    expect(s2.game).not.toBeNull();
    expect(s2.game!.inputs.slice(0, boas)).toEqual(s.game!.inputs);
    // as ruins saíram do banco
    expect((banco.entradas(codigo) as Input[]).slice(boas)).not.toContainEqual(ruim);
    await espera();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token: ana.ultima('sala')!.token });
    expect(volta.ultima('jogo')?.vista.you).toBe(0);
  }, 60000);

  it('replayAteFalhar: o motor quebrando no meio de uma entrada para na anterior, com a partida inteira', async () => {
    const { g, ana, codigo } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    await jogarAna(g, ana, 8);
    const s = g.salas.get(codigo)!;
    const entradas = s.game!.inputs;
    const k = Math.floor(entradas.length / 2);
    const decks = s.game!.decks;
    const config = s.d.partida!.config;
    const esperado = JSON.stringify(Game.replay(config, decks, entradas.slice(0, k)).state);
    // o passo da entrada k lança (o construtor faz o primeiro passo; cada entrada, um)
    const passo = (Game.prototype as unknown as { step: (a: unknown) => void }).step;
    let n = 0;
    const espiao = vi.spyOn(Game.prototype as unknown as { step: (a: unknown) => void }, 'step').mockImplementation(function (this: Game, a: unknown) {
      if (n++ === k + 1) { this.error = new Error('quebrou no meio'); throw this.error; }
      return passo.call(this, a);
    });
    let r: ReturnType<typeof Game.replayAteFalhar>;
    try {
      r = Game.replayAteFalhar(config, decks, entradas);
    } finally {
      espiao.mockRestore();
    }
    expect(r.aplicadas).toBe(k);
    expect(r.erro?.message).toBe('quebrou no meio');
    expect(r.game.error).toBeNull();
    expect(JSON.stringify(r.game.state)).toBe(esperado);
    // e com um checkpoint que não dá para retomar (estado quebrado), refaz do começo
    const quebrado = { state: {} as Game['state'], inputIndex: 2 };
    const r2 = Game.replayAteFalhar(config, decks, entradas.slice(0, k), quebrado);
    expect(r2.aplicadas).toBe(k);
    expect(JSON.stringify(r2.game.state)).toBe(esperado);
  }, 60000);
});

describe('assento que vaga', () => {
  it('a pessoa sai: todas as conexões do assento saem, e a de outra aba não recebe o token de quem senta depois', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const tokenBruno = bruno.ultima('sala')!.token;
    // a segunda aba de Bruno volta ao assento pelo token
    const aba = new Falsa();
    g.tratar(aba, { t: 'retomar', codigo, token: tokenBruno });
    expect(aba.ultima('sala')!.voce).toBe(1);
    g.tratar(bruno, { t: 'sair' });
    for (const p of [bruno, aba]) {
      expect(p.ultima('saiu')).toBeDefined();
      expect(p.sala).toBeNull();
      expect(p.assento).toBeNull();
    }
    const n = aba.msgs.length;
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('sala')!.voce).toBe(1);
    g.tratar(carla, { t: 'chat', texto: 'oi' });
    await espera();
    // a aba velha não recebe nada de Carla: nem a sala com o token dela, nem o chat
    expect(aba.msgs.slice(n)).toEqual([]);
    // e quem tenta voltar com o token velho não entra
    const velha = new Falsa();
    g.tratar(velha, { t: 'retomar', codigo, token: tokenBruno });
    expect(velha.ultima('erro')?.msg).toMatch(/Não foi possível voltar/);
  });

  it('uma conexão que ficou presa num assento que mudou de dono sai na transmissão seguinte, sem o token novo', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const s = g.salas.get(codigo)!;
    const presa = new Falsa();
    presa.sala = s;
    presa.assento = 1;
    presa.token = 'token-de-quem-saiu';
    s.conexoes.add(presa);
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const tokenBruno = bruno.ultima('sala')!.token;
    expect(presa.ultima('saiu')).toBeDefined();
    expect(JSON.stringify(presa.msgs)).not.toContain(tokenBruno);
    expect(s.conexoes.has(presa)).toBe(false);
  });

  /** sala de pessoas (Ana anfitriã) e bots, com decks, já começada */
  async function partidaDe(nomes: string[], bots = 0) {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ps = nomes.map(() => new Falsa());
    g.tratar(ps[0], { t: 'criar', nome: nomes[0], senhaSala: 'segredo', modo: nomes.length + bots > 2 ? '4p' : '1v1' });
    const codigo = ps[0].ultima('sala')!.sala.codigo;
    for (let k = 1; k < nomes.length; k++) g.tratar(ps[k], { t: 'entrar', codigo, senhaSala: 'segredo', nome: nomes[k] });
    for (let k = 0; k < bots; k++) g.tratar(ps[0], { t: 'bot', assento: nomes.length + k, deck: DECKS[nomes.length + k].id });
    ps.forEach((p, k) => g.tratar(p, { t: 'deck', deck: DECKS[k].id }));
    g.tratar(ps[0], { t: 'iniciar' });
    await espera();
    const s = g.salas.get(codigo)!;
    expect(s.d.estado).toBe('jogando');
    return { g, ps, codigo, s };
  }

  it('sala encerrada: quem sai faz a sala voltar para o saguão; quem entra depois não recebe a partida antiga', async () => {
    const { g, ps: [ana, bruno], codigo, s } = await partidaDe(['Ana', 'Bruno']);
    g.tratar(bruno, { t: 'conceder' });
    await espera();
    expect(s.d.estado).toBe('fim');
    expect(ana.ultima('jogo')!.vista.gameOver?.winners).toEqual([0]);
    g.tratar(bruno, { t: 'sair' });
    await espera();
    expect(ana.ultima('sala')!.sala).toMatchObject({ estado: 'espera', etapa: 'lugares', partida: null });
    expect(s.game).toBeNull();
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    await espera();
    expect(carla.ultima('sala')!.sala.estado).toBe('espera');
    expect(carla.ultima('jogo')).toBeUndefined();
    // e a sala começa outra partida pelo saguão
    g.tratar(carla, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(carla.ultima('jogo')!.vista.you).toBe(1);
  });

  it('a concessão de quem sai encerra a partida: quem fica vê o fim; "nova partida" leva ao saguão para preencher o lugar', async () => {
    const { g, ps: [ana, bruno], codigo, s } = await partidaDe(['Ana', 'Bruno']);
    g.tratar(bruno, { t: 'sair' });
    await espera();
    expect(s.d.estado).toBe('fim');
    expect(ana.ultima('sala')!.sala.estado).toBe('fim');
    expect(ana.ultima('jogo')!.vista.gameOver?.winners).toEqual([0]);
    expect(s.d.assentos[1].tipo).toBe('vazio');
    const n = ana.msgs.length;
    g.tratar(ana, { t: 'novaPartida' });
    await espera();
    expect(ana.msgs.slice(n).some((m) => m.t === 'erro')).toBe(false);
    expect(ana.ultima('sala')!.sala).toMatchObject({ estado: 'espera', partida: null });
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('jogo')).toBeUndefined();
  });

  it('quem chega numa sala encerrada com lugar vago leva todos para o saguão, sem a partida antiga', async () => {
    const { g, ps: [ana, bruno], codigo, s } = await partidaDe(['Ana', 'Bruno']);
    g.tratar(bruno, { t: 'sair' });
    await espera();
    expect(s.d.estado).toBe('fim');
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    await espera();
    expect(carla.ultima('sala')!.sala.estado).toBe('espera');
    expect(carla.ultima('jogo')).toBeUndefined();
    expect(ana.ultima('sala')!.sala.estado).toBe('espera');
  });

  it('quem sai no meio da partida fica com o assento até ela acabar; aí o lugar vaga e a nova partida passa pelo saguão', async () => {
    const { g, ps: [ana, bruno, carla], s } = await partidaDe(['Ana', 'Bruno', 'Carla'], 1);
    g.tratar(bruno, { t: 'sair' });
    await espera();
    expect(s.d.estado).toBe('jogando');
    expect(s.d.assentos[1]).toMatchObject({ tipo: 'humano', saiu: true });
    expect(bruno.ultima('saiu')).toBeDefined();
    g.tratar(carla, { t: 'conceder' });
    g.tratar(ana, { t: 'conceder' });
    await espera();
    expect(s.d.estado).toBe('fim');
    expect(s.d.assentos[1].tipo).toBe('vazio');
    // Ana e Carla ainda veem o fim da partida
    expect(ana.ultima('jogo')!.vista.gameOver).not.toBeNull();
    expect(ana.ultima('sala')!.sala.estado).toBe('fim');
    g.tratar(ana, { t: 'novaPartida' });
    await espera();
    expect(carla.ultima('sala')!.sala.estado).toBe('espera');
  });

  it('quem sai no meio da partida e volta pelo token continua com o assento no fim', async () => {
    const { g, ps: [ana, bruno, carla], codigo, s } = await partidaDe(['Ana', 'Bruno', 'Carla'], 1);
    const token = bruno.ultima('sala')!.token;
    g.tratar(bruno, { t: 'sair' });
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token });
    expect(s.d.assentos[1].saiu).toBeUndefined();
    g.tratar(carla, { t: 'conceder' });
    g.tratar(ana, { t: 'conceder' });
    await espera();
    expect(s.d.estado).toBe('fim');
    expect(s.d.assentos[1]).toMatchObject({ tipo: 'humano', nome: 'Bruno' });
    expect(volta.ultima('saiu')).toBeUndefined();
  });

  it('o anfitrião que sai no meio da partida passa a vez de conduzir para quem fica', async () => {
    const { g, ps: [ana], s } = await partidaDe(['Ana', 'Bruno', 'Carla'], 1);
    g.tratar(ana, { t: 'sair' });
    await espera();
    expect(s.d.anfitriao).toBe(1);
  });

  it('a mesma conexão não toma um segundo assento da sala em que está', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Ana de novo' });
    expect(ana.ultima('erro')?.msg).toMatch(/já está nesta sala/);
    expect(g.salas.get(codigo)!.d.assentos.filter((a) => a.tipo === 'humano')).toHaveLength(1);
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

/** pedido HTTP cru (sem descomprimir), para conferir cabeçalhos e corpo como o servidor mandou */
function pedir(porta: number, caminho: string, cabecalhos: Record<string, string> = {}): Promise<{ status: number; h: Record<string, string | string[] | undefined>; corpo: Buffer }> {
  return new Promise((ok, falha) => {
    const r = httpGet({ host: 'localhost', port: porta, path: caminho, headers: cabecalhos }, (res) => {
      const partes: Buffer[] = [];
      res.on('data', (d: Buffer) => partes.push(d));
      res.on('end', () => ok({ status: res.statusCode ?? 0, h: res.headers, corpo: Buffer.concat(partes) }));
    });
    r.on('error', falha);
  });
}

describe('servidor de verdade (processo à parte)', () => {
  let proc: ChildProcess;
  let porta = 0;
  let dados = '';
  let cookie = '';
  let saida = '';
  const url = () => `ws://localhost:${porta}/ws`;
  // cliente compilado de mentira: uma página, um script e um mp3
  const PAGINA = `<!doctype html><div id="app"></div>${'<!-- página -->'.repeat(200)}`;
  const SCRIPT = `console.log(${JSON.stringify('x'.repeat(50))});\n`.repeat(200);
  const MP3 = Buffer.from(Array.from({ length: 10240 }, (_, i) => (i * 37) % 256));

  beforeAll(async () => {
    porta = await portaLivre();
    mkdirSync(join(RAIZ, '.cache'), { recursive: true });
    dados = mkdtempSync(join(RAIZ, '.cache', 'teste-robustez-'));
    const estaticos = join(dados, 'dist');
    mkdirSync(join(estaticos, 'assets'), { recursive: true });
    writeFileSync(join(estaticos, 'index.html'), PAGINA);
    writeFileSync(join(estaticos, 'assets', 'app.js'), SCRIPT);
    writeFileSync(join(estaticos, 'musica.mp3'), MP3);
    proc = spawn(process.execPath, ['servidor/index.ts'], { cwd: RAIZ, env: { ...process.env, PORTA: String(porta), DADOS: dados, SENHA_ACESSO: 'senha-do-teste', HTTPS: '', ESTATICOS: estaticos } });
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

  it('HTTP: informações das cartas com ETag (304 na revalidação) e brotli', async () => {
    const a = await pedir(porta, '/api/cartas', { cookie, 'accept-encoding': 'gzip, br' });
    expect(a.status).toBe(200);
    expect(a.h['content-encoding']).toBe('br');
    expect(a.h.etag).toMatch(/^"[\w-]+"$/);
    const info = JSON.parse(brotliDecompressSync(a.corpo).toString());
    expect(Object.keys(info).length).toBeGreaterThan(100);
    const b = await pedir(porta, '/api/cartas', { cookie, 'if-none-match': String(a.h.etag) });
    expect(b.status).toBe(304);
    expect(b.corpo.length).toBe(0);
    // sem compressão pedida, o JSON puro, com o mesmo ETag
    const c = await pedir(porta, '/api/cartas', { cookie });
    expect(c.h['content-encoding']).toBeUndefined();
    expect(c.h.etag).toBe(a.h.etag);
    expect(JSON.parse(c.corpo.toString())).toEqual(info);
    // sem sessão continua fechado
    expect((await pedir(porta, '/api/cartas')).status).toBe(401);
  }, 30000);

  it('HTTP: o cliente sai comprimido e com ETag; index.html revalida', async () => {
    const js = await pedir(porta, '/assets/app.js', { 'accept-encoding': 'gzip' });
    expect(js.h['content-encoding']).toBe('gzip');
    expect(js.h['cache-control']).toMatch(/immutable/);
    expect(gunzipSync(js.corpo).toString()).toBe(SCRIPT);
    expect(js.corpo.length).toBeLessThan(SCRIPT.length / 5);
    const pg = await pedir(porta, '/', { 'accept-encoding': 'br' });
    expect(brotliDecompressSync(pg.corpo).toString()).toBe(PAGINA);
    expect(pg.h['cache-control']).toBe('no-cache');
    const de = await pedir(porta, '/qualquer/rota', { 'if-none-match': String(pg.h.etag) });
    expect(de.status).toBe(304);
  }, 30000);

  it('HTTP: pedido de intervalo (o Safari toca o mp3 assim)', async () => {
    const r = await pedir(porta, '/musica.mp3', { range: 'bytes=100-199' });
    expect(r.status).toBe(206);
    expect(r.h['content-range']).toBe(`bytes 100-199/${MP3.length}`);
    expect(r.h['accept-ranges']).toBe('bytes');
    expect(r.corpo.equals(MP3.subarray(100, 200))).toBe(true);
    const fim = await pedir(porta, '/musica.mp3', { range: 'bytes=-24' });
    expect(fim.corpo.equals(MP3.subarray(MP3.length - 24))).toBe(true);
    expect((await pedir(porta, '/musica.mp3', { range: 'bytes=20000-' })).status).toBe(416);
    const tudo = await pedir(porta, '/musica.mp3');
    expect(tudo.status).toBe(200);
    expect(tudo.corpo.equals(MP3)).toBe(true);
  }, 30000);

  it("'__proto__' como assento de bot: recusado, e o servidor e a sala continuam", async () => {
    const a = new Cliente(url(), cookie);
    await a.aberto();
    a.mandar({ t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    await a.esperar('sala');
    const n = a.msgs.length;
    a.mandar({ t: 'bot', assento: '__proto__', deck: null });
    expect(await a.esperar('erro', n)).toMatchObject({ msg: 'Mensagem inválida', de: 'bot' });
    expect(await a.vivo()).toBe(true);
    const k = a.msgs.length;
    a.mandar({ t: 'etapa', etapa: 'lugares' });
    expect((await a.esperar('sala', k)).sala.assentos).toHaveLength(2);
    a.ws.close();
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
