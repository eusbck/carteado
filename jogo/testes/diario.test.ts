// F1 (estudo do Arena, eventos 1): diário de eventos do motor (motor/diario.ts). Ordem e lotes, motivos das trocas de
// zona, quem vê cada objeto no instante do evento, teto e que as cópias dos bots não herdam o diário.
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { validateShape, type LiveDecision } from '../motor/ask.ts';
import type { Gen } from '../motor/defs.ts';
import { createTokens, destroy, discard, draw, mill, sacrifice } from '../motor/actions.ts';
import { diarioDesde, type EntradaDiario } from '../motor/diario.ts';
import { emit } from '../motor/triggers.ts';
import type { GameEvent } from '../motor/events.ts';

/** roda um gerador do motor sem refresh (o refresh do harness faz fork, e o fork não leva o diário) */
function runEffect<T>(tg: TestGame, gen: Gen<T>): T {
  let next = gen.next();
  for (let guard = 0; !next.done; guard++) {
    if (guard > 500) throw new Error('Gerador não terminou');
    const d = next.value as LiveDecision;
    const answer = tg.respond(d);
    const error = validateShape(d, answer) ?? d.validate?.(answer);
    if (error) throw new Error(`${d.prompt}: ${error}`);
    next = gen.next(answer);
  }
  return next.value;
}

function ligado(tg: TestGame, teto?: number): TestGame {
  tg.game.ligarDiario(teto);
  return tg;
}
const entradas = (tg: TestGame): EntradaDiario[] => tg.g.diario!.entradas;
const zonas = (tg: TestGame): EntradaDiario[] => entradas(tg).filter((e) => e.ev.type === 'zone');
const zonaDe = (tg: TestGame, nome: string): EntradaDiario | undefined => zonas(tg).find((e) => {
  const ev = e.ev as Extract<GameEvent, { type: 'zone' }>;
  return (tg.state.objects[ev.obj]?.def ?? tg.state.lki[ev.obj]?.obj.def ?? tg.state.lki[ev.old]?.obj.def) === nome;
});

describe('diário de eventos (F1)', () => {
  it('desligado por padrão; ligar cria o diário em g, fora do estado', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []] });
    expect(tg.g.diario).toBeNull();
    ligado(tg);
    expect(tg.g.diario).not.toBeNull();
    expect(JSON.stringify(tg.state)).not.toContain('entradas');
    expect(tg.game.checkpoint()?.state).not.toHaveProperty('diario');
  });

  it('fork (cópia dos bots) não herda o diário', () => {
    const tg = ligado(setup({ battlefield: [['Elvish Mystic'], []] }));
    expect(tg.game.fork().g.diario).toBeNull();
  });

  it('combate: dano, morte por ação de estado e gatilho de morrer em lotes separados e em ordem', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Elvish Mystic'], ['Zulaport Cutthroat']] });
    ligado(tg);
    tg.attack([['Elvish Mystic', 1]]).block([['Zulaport Cutthroat', 'Elvish Mystic']]);
    tg.passTo('combatDamage');
    tg.resolveAll();
    const es = entradas(tg);
    // seq cresce sem buraco
    expect(es.map((e) => e.seq)).toEqual(es.map((_, i) => es[0].seq + i));
    const dano = es.filter((e) => e.ev.type === 'damage');
    const mortes = es.filter((e) => e.ev.type === 'zone' && e.motivo === 'morrer');
    const gatilho = es.find((e) => e.ev.type === 'triggerOnStack');
    expect(dano.length).toBe(2);
    expect(mortes.length).toBe(2);
    expect(gatilho).toBeDefined();
    // os dois danos simultâneos no mesmo lote; as duas mortes juntas noutro, depois; o gatilho depois das mortes
    expect(new Set(dano.map((e) => e.lote)).size).toBe(1);
    expect(new Set(mortes.map((e) => e.lote)).size).toBe(1);
    expect(mortes[0].lote).toBeGreaterThan(dano[0].lote);
    expect(gatilho!.lote).toBeGreaterThan(mortes[0].lote);
    expect(dano[0].etapa).toBe('combatDamage');
    expect(dano[0].turno).toBe(tg.state.turn.number);
    // o campo é público
    expect(Object.values(dano[0].vis).every((v) => v === 'all')).toBe(true);
    // lotes ficam no diário, e diarioDesde continua do cursor
    const meio = es[1].seq;
    expect(diarioDesde(tg.g.diario!, meio).entradas[0].seq).toBe(meio + 1);
    expect(diarioDesde(tg.g.diario!, meio).salto).toBe(false);
  });

  it('motivos: destruir, sacrificar, descartar, moer, comprar, ficha', () => {
    const tg = ligado(setup({
      battlefield: [['Elvish Mystic', 'Wall of Omens'], []],
      hand: [['Island'], []],
      library: [['Forest', 'Swamp', 'Plains'], []],
    }));
    runEffect(tg, destroy(tg.g, [tg.bf('Elvish Mystic')]));
    runEffect(tg, sacrifice(tg.g, [tg.bf('Wall of Omens')]));
    runEffect(tg, discard(tg.g, 0, 1));
    runEffect(tg, draw(tg.g, 0, 1));
    runEffect(tg, mill(tg.g, 0, 1));
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(zonaDe(tg, 'Elvish Mystic')?.motivo).toBe('destruir');
    expect(zonaDe(tg, 'Wall of Omens')?.motivo).toBe('sacrificar');
    expect(zonaDe(tg, 'Island')?.motivo).toBe('descartar');
    expect(zonaDe(tg, 'Forest')?.motivo).toBe('comprar');
    expect(zonaDe(tg, 'Swamp')?.motivo).toBe('moer');
    expect(zonaDe(tg, 'Treasure')?.motivo).toBe('ficha');
    // só o evento zone leva motivo
    expect(entradas(tg).filter((e) => e.ev.type !== 'zone').every((e) => e.motivo === undefined)).toBe(true);
  });

  it('motivo legenda: a regra da lenda sai com cause sba, mas o motor diz o motivo', () => {
    // a escolha da regra da lenda já espera na montagem: liga antes de responder
    const tg = setup({ battlefield: [['Zetalpa, Primal Dawn', 'Zetalpa, Primal Dawn'], []], onStart: (t) => t.game.ligarDiario() });
    tg.pass();
    expect(zonaDe(tg, 'Zetalpa, Primal Dawn')?.motivo).toBe('legenda');
    expect(tg.g.diario!.dicas ?? {}).toEqual({});
  });

  it('motivos: resolver e anulada; conjurar vem como evento cast no lote', () => {
    const tg = ligado(setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper", 'Swamp'], ['Counterspell']], library: [['Forest', 'Forest'], []] }));
    tg.cast("Night's Whisper").pass();
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell').resolve();
    const casts = entradas(tg).filter((e) => e.ev.type === 'cast');
    expect(casts.length).toBe(2);
    expect(zonaDe(tg, "Night's Whisper")?.motivo).toBe('anulada');
    expect(zonaDe(tg, 'Counterspell')?.motivo).toBe('resolver');
  });

  it('vis: carta comprada só o dono vê; carta revelada todos veem', () => {
    const tg = ligado(setup({ library: [['Forest', 'Swamp'], []] }));
    runEffect(tg, draw(tg.g, 0, 1));
    const z = zonaDe(tg, 'Forest')!;
    const ev = z.ev as Extract<GameEvent, { type: 'zone' }>;
    expect(z.vis[ev.obj]).toEqual([0]); // na mão: só o dono
    expect(z.vis[ev.old]).toEqual([]); // no grimório (LKI): ninguém
    const comprou = entradas(tg).find((e) => e.ev.type === 'draw')!;
    expect(comprou.vis[ev.obj]).toEqual([0]);
    // revelada (visibleTo 'all') no topo do grimório: o objeto antigo era público; o novo, na mão, volta a ser do dono
    const topo = tg.state.zones.library[0][0];
    tg.state.objects[topo].visibleTo = 'all';
    runEffect(tg, draw(tg.g, 0, 1));
    const z2 = zonaDe(tg, 'Swamp')!;
    const ev2 = z2.ev as Extract<GameEvent, { type: 'zone' }>;
    expect(z2.vis[ev2.old]).toBe('all');
    expect(z2.vis[ev2.obj]).toEqual([0]);
  });

  it('teto: guarda só as últimas e diarioDesde avisa o salto', () => {
    const tg = ligado(setup({ battlefield: [['Elvish Mystic'], []] }), 3);
    const id = tg.bf('Elvish Mystic');
    for (let i = 0; i < 5; i++) emit(tg.g, [{ type: 'tap', obj: id }, { type: 'untap', obj: id }]);
    const d = tg.g.diario!;
    expect(d.entradas.length).toBe(3);
    expect(d.entradas.map((e) => e.seq)).toEqual([7, 8, 9]);
    expect(d.prox).toBe(10);
    expect(d.lote).toBe(5);
    expect(diarioDesde(d, 2).salto).toBe(true);
    expect(diarioDesde(d, 6).salto).toBe(false);
  });

  it('desligado, a partida anda igual (mesmo estado final)', () => {
    const roda = (comDiario: boolean) => {
      const tg = setup({ step: 'beginCombat', battlefield: [['Elvish Mystic'], ['Zulaport Cutthroat']] });
      if (comDiario) ligado(tg);
      tg.attack([['Elvish Mystic', 1]]).block([['Zulaport Cutthroat', 'Elvish Mystic']]);
      tg.passTo('main2');
      return JSON.stringify(tg.state);
    };
    expect(roda(true)).toBe(roda(false));
  });
});
