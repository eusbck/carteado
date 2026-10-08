// Fase 9, seção 4, no servidor: nível e nome dos bots (saguão, sala salva, reinício), nomes sem repetir, threads de
// pensar com limite global, a mesa respondendo enquanto um bot pensa e o aviso "está pensando…".
import { afterAll, describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { NOMES_BOTS } from '../servidor/nomes.ts';
import { defaultAnswer } from '../motor/ask.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import { Pensadores } from '../servidor/pensadores.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: (MsgServidor & { em?: number })[] = [];
  enviar(m: MsgServidor) { this.msgs.push({ ...m, em: performance.now() }); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    for (let i = this.msgs.length - 1; i >= 0; i--) if (this.msgs[i].t === t) return this.msgs[i] as Extract<MsgServidor, { t: T }>;
    return undefined;
  }
}

const espera = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const resposta = (d: Decision): MsgCliente => ({ t: 'responder', decisao: d.id, resposta: d.kind === 'payment' ? { kind: 'payment', auto: true } : d.kind === 'mulligan' ? { kind: 'mulligan', keep: true } : defaultAnswer(d) });

describe('fase 9: nível e nome dos bots na sala', () => {
  it('cada bot ganha um nome sorteado da lista, diferente dos outros e das pessoas, e o nível escolhido', () => {
    for (let rodada = 0; rodada < 20; rodada++) {
      const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
      const ana = new Falsa();
      // a pessoa tem o nome de um bot da lista: nenhum bot pode ficar com ele
      g.tratar(ana, { t: 'criar', nome: 'Robson', senhaSala: 'segredo', modo: '4p' });
      g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id, nivel: 'cartomante' });
      g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[2].id });
      g.tratar(ana, { t: 'bot', assento: 3, deck: DECKS[3].id, nivel: 'magicgod' });
      const sala = ana.ultima('sala')!.sala;
      const bots = sala.assentos.filter((a) => a.tipo === 'bot');
      expect(bots.map((a) => a.nivel)).toEqual(['cartomante', 'intermediario', 'magicgod']);
      const nomes = bots.map((a) => a.nome!);
      expect(new Set(nomes).size).toBe(3);
      for (const n of nomes) { expect(NOMES_BOTS).toContain(n); expect(n).toBe(n.toUpperCase()); expect(n).not.toBe('ROBSON'); }
      expect(sala.assentos[0].nivel).toBeNull();
    }
    expect(NOMES_BOTS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(NOMES_BOTS).size).toBe(NOMES_BOTS.length);
  }, 60000);

  it('trocar o nível ou o deck mantém o nome; uma pessoa que entra com o nome de um bot faz o bot trocar de nome', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id, nivel: 'facil' });
    const nome = ana.ultima('sala')!.sala.assentos[1].nome!;
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[2].id, nivel: 'dificil' });
    expect(ana.ultima('sala')!.sala.assentos[1]).toMatchObject({ nome, nivel: 'dificil', deck: DECKS[2].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[2].id, nivel: 'impossivel' as never });
    expect(ana.ultima('erro')?.msg).toMatch(/Nível/);
    // assento 2 vazio: uma pessoa entra com o nome do bot
    const bia = new Falsa();
    g.tratar(bia, { t: 'entrar', codigo, senhaSala: 'segredo', nome: nome.toLowerCase() });
    const a1 = bia.ultima('sala')!.sala.assentos[1];
    expect(a1.nome).not.toBe(nome);
    expect(NOMES_BOTS).toContain(a1.nome);
  });

  it('o nível e o nome ficam salvos com a sala e continuam os mesmos depois de reiniciar, com a partida em andamento', async () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id, nivel: 'iniciante' });
    const antes = ana.ultima('sala')!.sala.assentos[1];
    g.tratar(ana, { t: 'iniciar' });
    for (let k = 0; k < 200; k++) { await espera(); const d = ana.ultima('jogo')?.vista.decision; if (d) g.tratar(ana, resposta(d)); if ((ana.ultima('jogo')?.vista.turn.number ?? 0) >= 3) break; }
    const nomeNaMesa = ana.ultima('jogo')!.vista.players[1].name;
    expect(nomeNaMesa).toBe(antes.nome);
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token: ana.ultima('sala')!.token });
    const depois = volta.ultima('sala')!.sala.assentos[1];
    expect(depois).toMatchObject({ nome: antes.nome, nivel: 'iniciante', tipo: 'bot' });
    expect(volta.ultima('jogo')!.vista.players[1].name).toBe(antes.nome);
    expect((g2.salas.get(codigo) as unknown as { bots: Map<number, { nivel: string }> }).bots.get(1)!.nivel).toBe('iniciante');
  }, 120000);
});

describe('fase 9: desfazer e reinício com qualquer nível', () => {
  for (const nivel of ['iniciante', 'dificil', 'cartomante', 'magicgod'] as const) {
    it(`${nivel}: o bot aceita o desfazer na hora, e a partida retomada depois de reiniciar fica igual`, async () => {
      const banco = new Banco(':memory:');
      const g = new Gerente(banco, DECKS, SEM_ATRASO);
      const ana = new Falsa();
      g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
      const codigo = ana.ultima('sala')!.sala.codigo;
      g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
      g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id, nivel });
      g.tratar(ana, { t: 'paradas', paradas: { ...g.salas.get(codigo)!.d.assentos[0].paradas, skipWhenNothing: false } });
      g.tratar(ana, { t: 'iniciar' });
      // Ana passa até ter um terreno para jogar no próprio turno (o bot joga os turnos dele)
      let jogou: { mao: number[]; def: string } | null = null;
      for (let k = 0; k < 3000 && !jogou; k++) {
        await espera();
        const v = ana.ultima('jogo')?.vista;
        const d = v?.decision;
        if (!v || !d) continue;
        const terreno = d.kind === 'priority' && v.turn.active === v.you && v.turn.number >= 3 ? d.actions.find((a) => a.kind === 'play') : undefined;
        if (terreno) {
          jogou = { mao: v.hand.map((c) => c.id), def: v.hand.find((c) => c.id === terreno.obj)!.def };
          g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: terreno.id } });
        } else g.tratar(ana, resposta(d));
      }
      expect(jogou).not.toBeNull();
      await espera();
      g.tratar(ana, { t: 'desfazer' });
      await espera();
      expect(ana.ultima('jogo')!.desfazer).toBeNull();
      expect(ana.ultima('jogo')!.vista.hand.map((c) => c.id).sort()).toEqual([...jogou!.mao].sort());
      // reinício: a partida refeita das entradas gravadas é a mesma
      const antes = JSON.stringify(g.salas.get(codigo)!.game!.state);
      const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
      g2.restaurar();
      expect(JSON.stringify(g2.salas.get(codigo)!.game!.state)).toBe(antes);
    }, 180000);
  }
});

describe('fase 9: threads de pensar dos bots', () => {
  const abertas: Gerente[] = [];
  afterAll(async () => { for (const g of abertas) await g.pensadores?.fechar(); });

  it('o limite é global: com uma thread, uma segunda tarefa espera a vez', async () => {
    const p = new Pensadores(1);
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    void g;
    const config = { seed: 'fila', players: [{ name: 'A', deckId: DECKS[0].id }, { name: 'B', deckId: DECKS[1].id }], startingLife: 40, turnLimit: null, multiplayer: false };
    const { Game } = await import('../motor/game.ts');
    const game = Game.create(config, [DECKS[0], DECKS[1]]);
    const d = game.pending!;
    const { HeuristicBot } = await import('../bots/heuristico.ts');
    const bot = new HeuristicBot('x', d.player, { nivel: 'intermediario' });
    const pedido = { sala: 'S1', geracao: 1, cp: null, entradas: [], listas: [DECKS[0], DECKS[1]], tarefa: { nivel: 'intermediario' as const, eu: d.player, estado: bot.e, decisao: d.id, config } };
    const a = p.pensar(pedido);
    const b = p.pensar({ ...pedido, sala: 'S2' });
    expect(p.ocupacao).toEqual({ pensando: 1, esperando: 1 });
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra?.resposta?.kind).toBe('mulligan');
    expect(rb?.resposta?.kind).toBe('mulligan');
    expect(p.ocupacao).toEqual({ pensando: 0, esperando: 0 });
    await p.fechar();
  }, 120000);

  it('a mesa responde enquanto um Magic God pensa, e todos veem o aviso de que ele está pensando', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, { ...SEM_ATRASO, simulacoesBot: null, threads: 1, avisoPensando: 300 });
    abertas.push(g);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[4].id, nivel: 'magicgod' });
    g.tratar(ana, { t: 'iniciar' });
    // Ana só passa, até o bot passar do aviso de "pensando"
    let atrasoMax = 0;
    let pensando: number | null = null;
    for (let k = 0; k < 4000 && pensando === null; k++) {
      await espera(5);
      const p = ana.ultima('pensando');
      if (p?.assento !== undefined && p.assento !== null && (ana.ultima('jogo')?.vista.turn.number ?? 0) >= 1) pensando = p.assento;
      const d = ana.ultima('jogo')?.vista.decision;
      if (d && pensando === null) g.tratar(ana, resposta(d));
    }
    expect(pensando).toBe(1);
    // enquanto ele pensa: a linha principal não trava (temporizadores em dia) e as mensagens de Ana são atendidas na hora
    for (let k = 0; k < 10 && g.pensadores!.ocupacao.pensando > 0; k++) {
      const t0 = performance.now();
      await espera(20);
      atrasoMax = Math.max(atrasoMax, performance.now() - t0 - 20);
      const n = ana.msgs.length;
      const t1 = performance.now();
      g.tratar(ana, { t: 'paradas', paradas: { ...ana.ultima('jogo')!.paradas, othersTurn: k % 2 ? ['end'] : [] } });
      expect(ana.msgs.length).toBeGreaterThan(n); // a vista nova saiu
      expect(performance.now() - t1).toBeLessThan(150);
    }
    expect(atrasoMax).toBeLessThan(150);
    // quando ele responde, o aviso some
    for (let k = 0; k < 2000 && ana.ultima('pensando')?.assento !== null; k++) await espera(10);
    expect(ana.ultima('pensando')?.assento).toBeNull();
  }, 180000);
});
