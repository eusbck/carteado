// Tempo corrido da partida: persistência e protocolo no servidor, cálculo monotônico e formato no cliente.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { defaultAnswer } from '../motor/ask.ts';
import type { DeckList } from '../motor/state.ts';
import { formatarTempo, tempoDePartida } from '../cliente/src/cronometro.ts';
import { Banco } from '../servidor/banco.ts';
import type { Modo, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, PARADAS_PADRAO, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];
const INICIO = Date.parse('2026-10-10T18:00:00Z');
const bancos: Banco[] = [];
const espera = () => new Promise<void>((ok) => setImmediate(ok));

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  token: string | null = null;
  msgs: MsgServidor[] = [];
  enviarTexto?: (texto: string) => void;
  constructor(texto = false) {
    if (texto) this.enviarTexto = (json) => this.enviar(JSON.parse(json) as MsgServidor);
  }
  enviar(m: MsgServidor): void { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return this.msgs.findLast((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}

function preparar(modo: Modo = '1v1', texto = false) {
  const banco = new Banco(':memory:');
  bancos.push(banco);
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  g.sementeFixa = 'cronometro';
  const pessoas = Array.from({ length: modo === '4p' ? 4 : 2 }, () => new Falsa(texto));
  const ana = pessoas[0];
  g.tratar(ana, { t: 'criar', modo, nome: 'Ana', senhaSala: 'segredo' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  for (let i = 1; i < pessoas.length; i++) g.tratar(pessoas[i], { t: 'entrar', codigo, nome: `Jogador ${i + 1}`, senhaSala: 'segredo' });
  for (const [i, p] of pessoas.entries()) {
    g.tratar(p, { t: 'deck', deck: DECKS[i].id });
    g.tratar(p, { t: 'paradas', paradas: { ...PARADAS_PADRAO, skipWhenNothing: false } });
  }
  return { g, banco, codigo, s: g.salas.get(codigo)!, pessoas, ana };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(INICIO);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  for (const banco of bancos.splice(0)) banco.fechar();
});

describe('cronômetro: ciclo da partida e protocolo', () => {
  it.each(['1v1', '4p'] as const)('%s: começa no mulligan, já persistido e igual para todos', async (modo) => {
    const { g, s, banco, ana, pessoas } = preparar(modo);
    expect(s.publica().cronometro).toBeNull();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(s.game!.pending?.kind).toBe('mulligan');
    expect(s.publica().cronometro).toEqual({ iniciadaEm: INICIO, encerradaEm: null });
    const gravada = banco.salas()[0].dados as typeof s.d;
    expect(gravada.partida).toMatchObject({ iniciadaEm: INICIO, encerradaEm: null });
    expect(s.game!.state.config).not.toHaveProperty('iniciadaEm');
    for (const p of pessoas) expect(p.ultima('sala')).toMatchObject({ agora: INICIO, sala: { cronometro: { iniciadaEm: INICIO, encerradaEm: null } } });
  });

  it('início recusado por falta de lugar, autorização, deck ou deck indisponível não cria um cronômetro', async () => {
    const { g, s, banco, ana, pessoas } = preparar();
    const verificar = () => {
      expect(s.d.estado).toBe('espera');
      expect(s.d.partida).toBeNull();
      expect(s.publica().cronometro).toBeNull();
      expect((banco.salas()[0].dados as typeof s.d).partida).toBeNull();
    };
    g.tratar(pessoas[1], { t: 'iniciar' });
    expect(pessoas[1].ultima('erro')?.msg).toMatch(/Só quem criou/);
    verificar();
    g.tratar(pessoas[1], { t: 'sair' });
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/assentos vazios/);
    verificar();
    g.tratar(pessoas[1], { t: 'entrar', codigo: s.codigo, nome: 'Bruno', senhaSala: 'segredo' });
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/escolher um deck/);
    verificar();
    g.tratar(pessoas[1], { t: 'deck', deck: DECKS[1].id });
    g.trocarDecks(DECKS.slice(1));
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/não está mais disponível/);
    verificar();
    await espera();
  });

  it.each([false, true])('o tempo não provoca mensagens extras; agora entra depois da comparação (JSON: %s)', async (texto) => {
    const { g, s, ana, pessoas } = preparar('1v1', texto);
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const n = ana.msgs.length;
    vi.setSystemTime(INICIO + 20_000);
    s.transmitir();
    s.transmitir();
    expect(ana.msgs).toHaveLength(n);
    s.desligar(pessoas[1]);
    expect(ana.msgs.slice(n)).toHaveLength(1);
    expect(ana.ultima('sala')?.agora).toBe(INICIO + 20_000);
    expect(ana.ultima('sala')?.sala.cronometro?.iniciadaEm).toBe(INICIO);
  });

  it('recusar um segundo início e trocar de turno preservam a contagem em andamento', async () => {
    const { g, s, ana, pessoas } = preparar();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    vi.setSystemTime(INICIO + 4000);
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/já começou/);
    for (let i = 0; i < 120 && s.game!.state.turn.number < 2; i++) {
      const d = s.game!.pending!;
      g.tratar(pessoas[d.player], { t: 'responder', decisao: d.id, resposta: defaultAnswer(d) });
      await espera();
    }
    expect(s.game!.state.turn.number).toBeGreaterThanOrEqual(2);
    expect(s.publica().cronometro).toEqual({ iniciadaEm: INICIO, encerradaEm: null });
  });

  it('conceder em quatro jogadores mantém o cronômetro enquanto a partida continua', async () => {
    const { g, s, ana, pessoas } = preparar('4p');
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    vi.setSystemTime(INICIO + 9000);
    g.tratar(pessoas[1], { t: 'conceder' });
    await espera();
    expect(s.game!.state.players[1].left).toBe(true);
    expect(s.d.estado).toBe('jogando');
    expect(s.publica().cronometro).toEqual({ iniciadaEm: INICIO, encerradaEm: null });
  });

  it('reconectar e restaurar o servidor preservam o início e incluem o tempo desligado', async () => {
    const { g, s, banco, ana, codigo } = preparar();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const token = ana.ultima('sala')!.token;
    s.desligar(ana);
    vi.setSystemTime(INICIO + 123_000);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token });
    await espera();
    const m = volta.ultima('sala')!;
    expect(m.sala.cronometro).toEqual({ iniciadaEm: INICIO, encerradaEm: null });
    expect(m.agora).toBe(INICIO + 123_000);
    expect(tempoDePartida(m.sala.cronometro, { agora: m.agora, recebidoEm: 50 }, 50)).toBe(123);
  });

  it('registra o fim uma vez, preserva após reinício e começa outra contagem numa nova partida', async () => {
    const { g, s, banco, ana, pessoas, codigo } = preparar();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    vi.setSystemTime(INICIO + 75_010);
    g.tratar(pessoas[1], { t: 'conceder' });
    await espera();
    const final = { iniciadaEm: INICIO, encerradaEm: INICIO + 75_010 };
    expect(s.d.estado).toBe('fim');
    expect(ana.ultima('sala')?.sala.cronometro).toEqual(final);
    expect((banco.salas()[0].dados as typeof s.d).partida).toMatchObject(final);
    vi.setSystemTime(INICIO + 200_000);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token: ana.ultima('sala')!.token });
    await espera();
    expect(volta.ultima('sala')?.sala.cronometro).toEqual(final);
    expect(tempoDePartida(final, { agora: INICIO + 200_000, recebidoEm: 1 }, 1000)).toBe(75);
    g2.tratar(volta, { t: 'novaPartida' });
    await espera();
    expect(volta.ultima('sala')?.sala.cronometro).toEqual({ iniciadaEm: INICIO + 200_000, encerradaEm: null });
    expect(g2.salas.get(codigo)!.game!.pending?.kind).toBe('mulligan');
  });

  it('detecta e persiste o fim ao restaurar uma última entrada gravada antes da queda', async () => {
    const { g, s, banco, ana, codigo } = preparar();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    s.game!.concede(1);
    banco.adicionarEntradas(codigo, 0, s.game!.inputs);
    // simula a queda depois das entradas, antes de a sala salvar seu estado final
    expect(s.d.estado).toBe('jogando');
    vi.setSystemTime(INICIO + 60_000);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    await espera();
    const final = { iniciadaEm: INICIO, encerradaEm: INICIO + 60_000 };
    expect(g2.salas.get(codigo)!.publica()).toMatchObject({ estado: 'fim', cronometro: final });
    expect((banco.salas()[0].dados as typeof s.d).partida).toMatchObject(final);
    vi.setSystemTime(INICIO + 120_000);
    const g3 = new Gerente(banco, DECKS, SEM_ATRASO);
    g3.restaurar();
    g3.salas.get(codigo)!.garantirPartida();
    expect(g3.salas.get(codigo)!.publica().cronometro).toEqual(final);
  });

  it('partida antiga continua sem tempo disponível até começar a próxima', async () => {
    const { g, s, banco, ana, codigo } = preparar();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    delete s.d.partida!.iniciadaEm;
    delete s.d.partida!.encerradaEm;
    s.salvar();
    vi.setSystemTime(INICIO + 500_000);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token: ana.ultima('sala')!.token });
    await espera();
    expect(volta.ultima('sala')?.sala.cronometro).toBeNull();
    g2.tratar(volta, { t: 'conceder' });
    await espera();
    expect(g2.salas.get(codigo)!.d.estado).toBe('fim');
    expect(volta.ultima('sala')?.sala.cronometro).toBeNull();
    g2.tratar(volta, { t: 'novaPartida' });
    await espera();
    expect(volta.ultima('sala')?.sala.cronometro).toEqual({ iniciadaEm: INICIO + 500_000, encerradaEm: null });
  });
});

describe('cronômetro: relógio e apresentação', () => {
  it.each([
    [null, '--:--'], [0, '00:00'], [9, '00:09'], [60, '01:00'], [3599, '59:59'],
    [3600, '01:00:00'], [3661, '01:01:01'], [360_001, '100:00:01'],
  ] as const)('formata %s segundos como %s', (segundos, esperado) => {
    expect(formatarTempo(segundos)).toBe(esperado);
  });

  it('recalcula a diferença, incluindo intervalos espaçados, sem usar o relógio local', () => {
    const c = { iniciadaEm: INICIO, encerradaEm: null };
    const r = { agora: INICIO + 10_000, recebidoEm: 500 };
    const monotono = vi.spyOn(performance, 'now');
    monotono.mockReturnValue(1499);
    expect(tempoDePartida(c, r)).toBe(10);
    vi.setSystemTime(INICIO - 24 * 3600_000);
    monotono.mockReturnValue(1500);
    expect(tempoDePartida(c, r)).toBe(11);
    monotono.mockReturnValue(500 + 100_000);
    expect(tempoDePartida(c, r)).toBe(110);
    expect(tempoDePartida(c, { agora: INICIO - 1000, recebidoEm: 0 }, 0)).toBe(0);
  });

  it('uma referência nova ao recarregar ou reconectar não reinicia o tempo', () => {
    const c = { iniciadaEm: INICIO, encerradaEm: null };
    const antes = tempoDePartida(c, { agora: INICIO, recebidoEm: 5000 }, 155_000);
    const depois = tempoDePartida(c, { agora: INICIO + 150_000, recebidoEm: 20 }, 20);
    expect(antes).toBe(150);
    expect(depois).toBe(antes);
    expect(tempoDePartida(c, { agora: INICIO + 160_000, recebidoEm: 80 }, 1080)).toBe(161);
  });

  it('o tempo final fica congelado, mesmo sem referência; partida sem início é indisponível', () => {
    const c = { iniciadaEm: INICIO, encerradaEm: INICIO + 3599_999 };
    expect(tempoDePartida(c, null, 1_000_000)).toBe(3599);
    expect(tempoDePartida(null, { agora: INICIO, recebidoEm: 0 }, 9999)).toBeNull();
    expect(tempoDePartida({ iniciadaEm: INICIO, encerradaEm: null }, null, 9999)).toBeNull();
  });
});
