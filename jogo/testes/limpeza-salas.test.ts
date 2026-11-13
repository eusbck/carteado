// Limpeza das salas: o botão Apagar da área do desenvolvedor (Gerente.apagarSala) e a limpeza automática das salas
// sem ninguém (Gerente.limparOciosas ao longo do tempo e Gerente.restaurar ao subir), com os prazos de PRAZO_OCIOSA.
import { afterEach, describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, PRAZO_OCIOSA, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];
const HORA = 3600_000;
const bancos: Banco[] = [];
const espera = () => new Promise<void>((ok) => setImmediate(ok));

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  token: string | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor): void { this.msgs.push(m); }
}

function preparar(banco = new Banco(':memory:')) {
  bancos.push(banco);
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  g.sementeFixa = 'limpeza';
  return { g, banco };
}

/** uma sala com Ana e um bot; `jogar`: a partida começa */
async function sala(g: Gerente, jogar: boolean) {
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', modo: '1v1', nome: 'Ana', senhaSala: 'segredo' });
  const codigo = (ana.msgs.findLast((m) => m.t === 'sala') as Extract<MsgServidor, { t: 'sala' }>).sala.codigo;
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
  if (jogar) { g.tratar(ana, { t: 'iniciar' }); await espera(); }
  return { ana, codigo, s: g.salas.get(codigo)! };
}

afterEach(() => { for (const b of new Set(bancos.splice(0))) b.fechar(); });

describe('apagar sala (área do desenvolvedor)', () => {
  it('tira da memória e do banco, avisa e solta quem está nela', async () => {
    const { g, banco } = preparar();
    const { ana, codigo, s } = await sala(g, true);
    expect(banco.salas().some((x) => x.codigo === codigo)).toBe(true);
    expect(g.apagarSala(codigo)).toBe(true);
    expect(g.salas.has(codigo)).toBe(false);
    expect(banco.salas().some((x) => x.codigo === codigo)).toBe(false);
    expect(banco.entradas(codigo)).toEqual([]);
    expect(ana.msgs.some((m) => m.t === 'saiu')).toBe(true);
    expect(ana.sala).toBeNull();
    // nada grava a sala de volta depois de apagada
    s.salvar();
    expect(banco.salas().some((x) => x.codigo === codigo)).toBe(false);
    expect(g.apagarSala(codigo)).toBe(false);
  });
});

describe('limpeza automática', () => {
  it('sala com gente nunca sai; vazia sai depois do prazo do estado', async () => {
    const { g } = preparar();
    const espera1 = await sala(g, false);
    const jogando = await sala(g, true);
    const agora = Date.now();
    // as duas com gente: nada sai, mesmo muito depois
    expect(g.limparOciosas(agora + 30 * 24 * HORA)).toEqual([]);
    expect(espera1.s.ociosaDesde).toBeNull();
    g.desconectar(espera1.ana);
    g.desconectar(jogando.ana);
    // primeira passada marca desde quando estão vazias
    expect(g.limparOciosas(agora)).toEqual([]);
    expect(espera1.s.ociosaDesde).toBe(agora);
    expect(g.limparOciosas(agora + PRAZO_OCIOSA.espera - 1)).toEqual([]);
    expect(g.limparOciosas(agora + PRAZO_OCIOSA.espera)).toEqual([espera1.codigo]);
    expect(g.limparOciosas(agora + PRAZO_OCIOSA.jogando - 1)).toEqual([]);
    expect(g.limparOciosas(agora + PRAZO_OCIOSA.jogando)).toEqual([jogando.codigo]);
    expect(g.salas.size).toBe(0);
  });

  it('alguém que volta zera a conta', async () => {
    const { g } = preparar();
    const { ana, codigo, s } = await sala(g, false);
    g.desconectar(ana);
    const agora = Date.now();
    g.limparOciosas(agora);
    s.conexoes.add(new Falsa());
    g.limparOciosas(agora + 23 * HORA);
    expect(s.ociosaDesde).toBeNull();
    s.conexoes.clear();
    g.limparOciosas(agora + 23 * HORA);
    expect(g.limparOciosas(agora + 40 * HORA)).toEqual([]);
    expect(g.limparOciosas(agora + 47 * HORA)).toEqual([codigo]);
  });

  it('ao subir, as salas paradas além do prazo saem do banco sem ser refeitas', async () => {
    const banco = new Banco(':memory:');
    const antes = preparar(banco).g;
    const velha = await sala(antes, false);
    const partida = await sala(antes, true);
    const agora = Date.now();
    const depois = preparar(banco).g;
    depois.restaurar(agora + 2 * 24 * HORA);
    expect(depois.salas.has(velha.codigo)).toBe(false);
    expect(banco.salas().some((x) => x.codigo === velha.codigo)).toBe(false);
    expect(depois.salas.has(partida.codigo)).toBe(true);
    expect(depois.salas.get(partida.codigo)!.paraDev()).toMatchObject({ apagaEm: expect.any(Number) });
  });
});
