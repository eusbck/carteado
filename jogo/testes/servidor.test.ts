// Salas e condução da partida no servidor, sem rede (conexões falsas e banco em memória).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { registry } from '../motor/defs.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

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

async function salaComBots(g: Gerente, modo: '4p' | '1v1' = '4p') {
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo });
  const codigo = ana.ultima('sala')!.sala.codigo;
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  const n = modo === '4p' ? 4 : 2;
  for (let i = 1; i < n; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[i].id });
  return { ana, codigo };
}

/** responde as decisões de Ana com a resposta padrão até a partida esperar outra coisa */
async function jogarAna(g: Gerente, ana: Falsa, n: number) {
  for (let i = 0; i < n; i++) {
    await espera();
    const v = ana.ultima('jogo')?.vista;
    const d = v?.decision;
    if (!d) return;
    const resp: MsgCliente = d.kind === 'mulligan' ? { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } }
      : d.kind === 'priority' ? { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } }
      : d.kind === 'select' ? { t: 'responder', decisao: d.id, resposta: { kind: 'select', ids: d.items.filter((x) => !x.disabled).slice(0, d.min).map((x) => x.id) } }
      : d.kind === 'payment' ? { t: 'responder', decisao: d.id, resposta: { kind: 'payment', auto: true } }
      : d.kind === 'attackers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'attackers', attacks: [] } }
      : d.kind === 'blockers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'blockers', blocks: [] } }
      : d.kind === 'number' ? { t: 'responder', decisao: d.id, resposta: { kind: 'number', value: d.min } }
      : { t: 'conceder' };
    g.tratar(ana, resp);
  }
}

describe('servidor: salas', () => {
  it('cria sala com código e senha; senha errada não entra; cheia não entra', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    expect(codigo).toMatch(/^[A-Z2-9]{5}$/);
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'errada', nome: 'Bruno' });
    expect(bruno.ultima('erro')?.msg).toMatch(/senha/);
    g.tratar(bruno, { t: 'entrar', codigo: codigo.toLowerCase(), senhaSala: 'segredo', nome: 'Bruno' });
    expect(bruno.ultima('sala')?.voce).toBe(1);
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('erro')?.msg).toMatch(/cheia/);
  });

  it('só o anfitrião começa; todos precisam de deck', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    g.tratar(bruno, { t: 'iniciar' });
    expect(bruno.ultima('erro')?.msg).toMatch(/criou a sala/);
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/deck/);
  });

  it('partida de 4 com 3 bots: cada um recebe só a própria mão; a partida anda até Ana decidir', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana } = await salaComBots(g);
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const v = ana.ultima('jogo')!.vista;
    expect(v.players.length).toBe(4);
    expect(v.you).toBe(0);
    expect(v.hand.every((c) => c.owner === 0)).toBe(true);
    expect(v.decision?.player).toBe(0);
    // nada da mão dos outros na vista
    const s = g.salas.values().next().value!.game!.state;
    const maosOutros = [1, 2, 3].flatMap((p) => s.zones.hand[p]);
    expect(JSON.stringify(v)).not.toMatch(new RegExp(`"id":(${maosOutros.join('|')}),"def":"[^"]`));
  });

  it('resposta a decisão antiga ou de outro jogador é recusada', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana } = await salaComBots(g);
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const d = ana.ultima('jogo')!.vista.decision!;
    g.tratar(ana, { t: 'responder', decisao: d.id + 5, resposta: { kind: 'mulligan', keep: true } });
    expect(ana.ultima('erro')?.msg).toMatch(/já passou/);
  });

  it('a partida sobrevive a um reinício do servidor e Ana volta ao mesmo assento pelo token', async () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const { ana, codigo } = await salaComBots(g);
    g.tratar(ana, { t: 'iniciar' });
    await jogarAna(g, ana, 25);
    const token = ana.ultima('sala')!.token;
    const antes = g.salas.get(codigo)!.game!;
    const estadoAntes = JSON.stringify(antes.state);
    // "reinício": novo gerente com o mesmo banco
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    await espera();
    const depois = g2.salas.get(codigo)!.game!;
    expect(JSON.stringify(depois.state)).toBe(estadoAntes);
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token });
    expect(volta.ultima('sala')?.voce).toBe(0);
    expect(volta.ultima('jogo')?.vista.you).toBe(0);
    const intruso = new Falsa();
    g2.tratar(intruso, { t: 'retomar', codigo, token: 'x' });
    expect(intruso.ultima('erro')).toBeDefined();
  }, 120000); // os bots heurísticos pensam a cada jogada; com a suíte inteira rodando junto, demora mais

  it('1v1 com bot vai até o fim quando Ana concede', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana, codigo } = await salaComBots(g, '1v1');
    g.tratar(ana, { t: 'iniciar' });
    await jogarAna(g, ana, 30);
    g.tratar(ana, { t: 'conceder' });
    await espera();
    expect(ana.ultima('jogo')!.vista.gameOver?.winners).toEqual([1]);
    expect(g.salas.get(codigo)!.d.estado).toBe('fim');
  }, 120000); // o bot heurístico simula cada jogada
});

/** responde o padrão até a pessoa ter prioridade com ajuste manual disponível */
async function ateAPrioridade(g: Gerente, p: Falsa, limite = 80) {
  for (let i = 0; i < limite; i++) {
    await espera();
    const d = p.ultima('jogo')?.vista.decision;
    if (d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual')) return d;
    if (d) await jogarAna(g, p, 1);
  }
  throw new Error('a prioridade não chegou');
}

describe('servidor: mesa nova (regra de mulligan, posições, revelar)', () => {
  it('só quem criou a sala escolhe a regra de mulligan, e ela vai para a partida', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    expect(ana.ultima('sala')!.sala.mulligan).toBe('londres');
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    g.tratar(bruno, { t: 'mulligan', regra: 'livre' });
    expect(bruno.ultima('erro')?.msg).toMatch(/criou a sala/);
    g.tratar(ana, { t: 'mulligan', regra: 'livre' });
    await espera();
    expect(bruno.ultima('sala')!.sala.mulligan).toBe('livre');
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(g.salas.get(codigo)!.game!.state.config.mulligan).toBe('livre');
    g.tratar(ana, { t: 'mulligan', regra: 'londres' });
    expect(ana.ultima('erro')?.msg).toMatch(/já começou/);
  });

  it('cada um arruma só as próprias permanentes; as posições vão para todos e podem ser limpas', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    // semente fixa: com a sorteada, algumas mãos faziam a prioridade de Ana não chegar no limite de respostas
    g.sementeFixa = 'servidor-posicoes';
    const { ana, codigo } = await salaComBots(g, '1v1');
    g.tratar(ana, { t: 'iniciar' });
    const d = await ateAPrioridade(g, ana);
    const ficha = [...registry.tokens.keys()][0];
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'manual', manual: { k: 'ficha', def: ficha, n: 1, player: 0 } } });
    await espera();
    const sala = g.salas.get(codigo)!;
    const minha = sala.game!.state.zones.battlefield.find((id) => sala.game!.state.objects[id].controller === 0)!;
    expect(minha).toBeDefined();
    g.tratar(ana, { t: 'posicao', obj: minha, x: 0.5, y: 0.25 });
    expect(ana.ultima('jogo')!.posicoes[String(minha)]).toEqual([0.5, 0.25]);
    // carta que já não está no campo (sacrificada antes de a posição chegar, como o Campo de Lótus): ignorada, sem erro
    const errosAntes = ana.msgs.filter((m) => m.t === 'erro').length;
    g.tratar(ana, { t: 'posicao', obj: 99999, x: 0.1, y: 0.1 });
    expect(ana.msgs.filter((m) => m.t === 'erro').length).toBe(errosAntes);
    expect(ana.ultima('jogo')!.posicoes['99999']).toBeUndefined();
    g.tratar(ana, { t: 'posicao', obj: minha, x: 7, y: 0.1 });
    expect(ana.ultima('erro')?.msg).toMatch(/inválida/);
    g.tratar(ana, { t: 'posicao', limpar: true });
    expect(ana.ultima('jogo')!.posicoes).toEqual({});
  }, 60000);

  it('revelar mostra a carta da mão só para quem foi escolhido', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    g.tratar(ana, { t: 'bot', assento: 3, deck: DECKS[3].id });
    for (const [i, p] of [ana, bruno, carla].entries()) g.tratar(p, { t: 'deck', deck: DECKS[i].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const carta = ana.ultima('jogo')!.vista.hand[0];
    g.tratar(ana, { t: 'revelar', obj: carta.id, para: [1] });
    expect(bruno.ultima('revelada')).toMatchObject({ de: 0, def: carta.def });
    expect(ana.ultima('revelada')).toMatchObject({ de: 0, para: [1] });
    expect(carla.ultima('revelada')).toBeUndefined();
    g.tratar(ana, { t: 'revelar', obj: carta.id, para: 'todos' });
    expect(carla.ultima('revelada')?.def).toBe(carta.def);
    const deBruno = bruno.ultima('jogo')!.vista.hand[0];
    g.tratar(ana, { t: 'revelar', obj: deBruno.id, para: 'todos' });
    expect(ana.ultima('erro')?.msg).toMatch(/não está na sua mão/);
  });
});
