// A pilha que acabou de mudar segura a mesa (servidor/pilha-visivel.ts): a conta da rajada (base, metade, teto de 4×,
// a mágica da própria pessoa pela metade, a pilha vazia recomeça) e, na sala, a vista com o objeto novo chegando antes
// da resolução, com o tempo de segurar entre as duas; no passe automático de uma pessoa, a vista sai neutra (ninguém
// decidindo nem esperado), e a decisão que o servidor passa sozinho nunca aparece.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { DEFAULT_STOPS, type StopSettings } from '../motor/autopass.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameState, ObjId, PlayerId } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';
import { Banco } from '../servidor/banco.ts';
import { novaRajada, segurarPilha } from '../servidor/pilha-visivel.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import { setup, type SetupOptions } from './harness.ts';

const DECKS = decksJson as DeckList[];

/** a pilha de baixo para cima: [id, tipo, controlador] (só o que segurarPilha lê do estado) */
function pilha(objs: [ObjId, 'spell' | 'triggered' | 'activated', PlayerId][]): GameState {
  return { zones: { stack: objs.map(([id]) => id) }, objects: Object.fromEntries(objs.map(([id, kind, controller]) => [id, { stack: { kind, controller } }])) } as unknown as GameState;
}
// assento 0: a pessoa; 1: o bot
const humano = (p: PlayerId) => p === 0;

describe('segurarPilha: a conta da rajada', () => {
  it('1º objeto novo: base; os seguintes: metade; cada um uma vez; teto de 4× base; a pilha vazia recomeça', () => {
    const r = novaRajada();
    const objs: [ObjId, 'triggered', PlayerId][] = [];
    const empilha = (id: ObjId) => { objs.push([id, 'triggered', 1]); return segurarPilha(r, pilha(objs), humano, 900); };
    expect(empilha(1)).toBe(900);
    // o mesmo objeto não segura de novo
    expect(segurarPilha(r, pilha(objs), humano, 900)).toBe(0);
    expect([2, 3, 4, 5, 6, 7].map(empilha)).toEqual([450, 450, 450, 450, 450, 450]);
    // 900 + 6 × 450 = 3600 = 4 × 900: a onda de gatilhos não segura mais
    expect(r.gasto).toBe(3600);
    expect(empilha(8)).toBe(0);
    // a pilha esvaziou: outra rajada, o primeiro volta a segurar a base
    expect(segurarPilha(r, pilha([]), humano, 900)).toBe(0);
    expect(r.gasto).toBe(0);
    expect(segurarPilha(r, pilha([[20, 'activated', 1]]), humano, 900)).toBe(900);
  });

  it('o teto corta o último pedaço', () => {
    const r = novaRajada();
    const objs: [ObjId, 'spell' | 'triggered', PlayerId][] = [];
    const empilha = (id: ObjId) => { objs.push([id, id === 2 ? 'spell' : 'triggered', id === 2 ? 0 : 1]); return segurarPilha(r, pilha(objs), humano, 1000); };
    // 1000 + 250 (a mágica de Ana, pela metade) + 500 × 5 = 3750: o seguinte só tem 250 até o teto, e o outro, nada
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map(empilha)).toEqual([1000, 250, 500, 500, 500, 500, 500, 250, 0]);
    expect(r.gasto).toBe(4000);
  });

  it('a mágica de uma pessoa segura metade (ela sabe o que conjurou); gatilho dela e mágica do bot, não', () => {
    const r = novaRajada();
    expect(segurarPilha(r, pilha([[1, 'spell', 0]]), humano, 900)).toBe(450);
    // o bot responde: mágica dele, a segunda da rajada
    expect(segurarPilha(r, pilha([[1, 'spell', 0], [2, 'spell', 1]]), humano, 900)).toBe(450);
    // a pessoa responde de novo: a segunda metade, pela metade
    expect(segurarPilha(r, pilha([[1, 'spell', 0], [2, 'spell', 1], [3, 'spell', 0]]), humano, 900)).toBe(225);
    // o gatilho da pessoa segura como os outros
    const r2 = novaRajada();
    expect(segurarPilha(r2, pilha([[1, 'triggered', 0]]), humano, 900)).toBe(900);
  });

  it('base 0 (a pessoa parou na pilha): marca como vista sem segurar; o objeto novo seguinte segura a base', () => {
    const r = novaRajada();
    expect(segurarPilha(r, pilha([[1, 'spell', 1]]), humano, 0)).toBe(0);
    expect(segurarPilha(r, pilha([[1, 'spell', 1]]), humano, 900)).toBe(0);
    expect(segurarPilha(r, pilha([[1, 'spell', 1], [2, 'triggered', 1]]), humano, 900)).toBe(900);
  });
});

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  /** quando cada mensagem chegou (performance.now) */
  em: number[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); this.em.push(performance.now()); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  /** as vistas recebidas a partir da mensagem `de`, com a hora de cada uma */
  vistas(de = 0): { v: GameView; t: number }[] {
    return this.msgs.flatMap((m, k) => (k >= de && m.t === 'jogo' ? [{ v: m.vista, t: this.em[k] }] : []));
  }
}

const SEGURA = 40;

/**
 * Sala 1v1 retomada de um checkpoint montado com o arcabouço: Ana (assento 0, pessoa) contra um bot, as duas
 * bibliotecas com Florestas. Ana para na fase principal 1 do turno dela e na etapa final do bot, mesmo sem jogada.
 */
function sala(o: SetupOptions, paradas: Partial<StopSettings> = {}) {
  const tg = setup({ players: 2, library: [['Forest', 'Forest', 'Forest', 'Forest'], ['Forest', 'Forest', 'Forest', 'Forest']], ...o });
  const banco = new Banco(':memory:');
  const codigo = 'PILHA';
  const deckIds = [DECKS[0].id, DECKS[1].id];
  banco.salvarSala(codigo, {
    codigo, senha: '00:00', modo: '1v1', estado: 'jogando', anfitriao: 0, mulligan: 'londres',
    assentos: (['humano', 'bot'] as const).map((tipo, i) => ({
      tipo, nome: tg.state.players[i].name, deck: deckIds[i], token: tipo === 'humano' ? `token-${i}` : null,
      paradas: { ...DEFAULT_STOPS, myTurn: ['main1'], othersTurn: ['end'], skipWhenNothing: false, ...paradas },
    })),
    partida: { config: tg.state.config, deckIds, checkpoint: tg.game.checkpoint(), posicoes: {} },
  });
  const g = new Gerente(banco, DECKS, { ...SEM_ATRASO, pilhaNova: SEGURA });
  g.restaurar();
  const ana = new Falsa();
  g.tratar(ana, { t: 'retomar', codigo, token: 'token-0' });
  return { g, ana };
}

/** Ana passa a decisão de prioridade que tem e espera a mesa parar nela de novo (ou acabar o tempo) */
async function passarEEsperar(g: Gerente, ana: Falsa, ate: (v: GameView) => boolean): Promise<number> {
  const d = ana.ultima('jogo')!.vista.decision!;
  expect(d.kind).toBe('priority');
  const de = ana.msgs.length;
  g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } });
  const t0 = performance.now();
  while (!ana.vistas(de).some(({ v }) => ate(v)) && performance.now() - t0 < 3000) await new Promise((r) => setTimeout(r, 5));
  return de;
}

/** a vista com o gatilho do Carneiro na pilha e a primeira depois dela com a pilha vazia */
function gatilhoEResolucao(ana: Falsa, de: number) {
  const vs = ana.vistas(de);
  const k = vs.findIndex(({ v }) => v.stack.length === 1 && v.stack[0].def === 'Nyx-Fleece Ram' && v.stack[0].kind === 'triggered');
  expect(k).toBeGreaterThanOrEqual(0);
  const depois = vs.slice(k + 1).find(({ v }) => v.stack.length === 0);
  expect(depois).toBeDefined();
  return { pilha: vs[k], resolvida: depois!, vs };
}

describe('sala: a pilha nova fica à vista antes de resolver', () => {
  it('gatilho de Ana no passe automático dela: vista neutra com o gatilho, a resolução só depois do tempo de segurar', async () => {
    // etapa final do bot (Ana para ali); na manutenção dela, o Carneiro dispara e ela passa sozinha (sem parada ali)
    const { g, ana } = sala({ step: 'end', active: 1, battlefield: [['Nyx-Fleece Ram'], []] });
    expect(ana.ultima('jogo')!.vista.turn).toMatchObject({ active: 1, step: 'end' });
    const de = await passarEEsperar(g, ana, (v) => v.turn.step === 'main1' && v.decision !== null);
    const { pilha: p, resolvida, vs } = gatilhoEResolucao(ana, de);
    // neutra: ninguém decidindo nem esperado (as paradas de Ana não aparecem)
    expect(p.v.decision).toBeNull();
    expect(p.v.waiting).toBeNull();
    expect(p.v.turn).toMatchObject({ active: 0, step: 'upkeep' });
    // folga de 2 ms para o relógio do temporizador
    expect(resolvida.t - p.t).toBeGreaterThanOrEqual(SEGURA - 2);
    expect(resolvida.v.players[0].life).toBe(41);
    // a decisão que o servidor passou sozinho nunca chegou a Ana
    expect(vs.filter(({ v }) => v.turn.step === 'upkeep' && v.decision !== null)).toEqual([]);
    expect(ana.ultima('jogo')!.vista.turn).toMatchObject({ active: 0, step: 'main1' });
  });

  it('gatilho do bot: a mesa segura o passe dele com o gatilho à vista', async () => {
    // fase principal 2 de Ana (ela para ali); na manutenção do bot, o Carneiro dele dispara
    const { g, ana } = sala({ step: 'main2', active: 0, battlefield: [[], ['Nyx-Fleece Ram']] }, { myTurn: ['main1', 'main2'], stopOnOpponentStack: false });
    expect(ana.ultima('jogo')!.vista.turn).toMatchObject({ active: 0, step: 'main2' });
    const de = await passarEEsperar(g, ana, (v) => v.turn.active === 1 && v.decision !== null);
    expect(ana.ultima('jogo')!.vista.turn.step).toBe('end');
    const { pilha: p, resolvida, vs } = gatilhoEResolucao(ana, de);
    expect(p.v.decision).toBeNull();
    expect(p.v.turn).toMatchObject({ active: 1, step: 'upkeep' });
    expect(resolvida.t - p.t).toBeGreaterThanOrEqual(SEGURA - 2);
    expect(resolvida.v.players[1].life).toBe(41);
    expect(vs.filter(({ v }) => v.turn.step === 'upkeep' && v.decision !== null)).toEqual([]);
  });
});
