// Onda B (registro R2): o redator (motor/redator.ts) conta no registro o que vem dos eventos. Só com
// `config.registroDetalhado`; sem ele (testes, cópias dos bots), nada muda.

import { describe, expect, it } from 'vitest';
import type { LogEntry, LogKind } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';
import { setup, type SetupOptions, type TestGame } from './harness.ts';

function detalhado(o: SetupOptions): TestGame {
  const tg = setup(o);
  tg.state.config = { ...tg.state.config, registroDetalhado: true };
  return tg;
}
const linhas = (tg: TestGame, kind: LogKind): LogEntry[] => tg.state.log.filter((e) => e.kind === kind);
const textos = (tg: TestGame, kind: LogKind) => linhas(tg, kind).map((e) => e.text);
/** o texto remontado a partir de parts e refs bate com `text` */
const NOMES = ['Ana', 'Bruno', 'Caio', 'Dani'];
const remonta = (e: LogEntry) => e.parts!.map((p) => { if (typeof p === 'string') return p; const r = e.refs![p.ref]; return r.k === 'obj' ? r.name : NOMES[r.id]; }).join('');

describe('redator: desligado', () => {
  it('sem registroDetalhado, compras e mortes não entram (as linhas de sempre continuam)', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Sign in Blood'], []], library: [['Island', 'Forest'], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Sign in Blood').resolve();
    expect(linhas(tg, 'compra')).toEqual([]);
    expect(linhas(tg, 'vida')).toEqual([]);
    expect(tg.state.log.some((e) => e.grupo)).toBe(false);
  });
});

describe('redator: compras', () => {
  it('as compras da mesma jogada viram uma linha; os outros leem só quantas', () => {
    const tg = detalhado({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Sign in Blood'], []], library: [['Island', 'Forest', 'Plains'], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Sign in Blood').resolve();
    const c = linhas(tg, 'compra');
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ text: 'Ana compra Island, Forest.', visibleTo: [0], hiddenText: 'Ana compra 2 cartas.', actor: 0, rule: '121.1' });
    expect(remonta(c[0])).toBe(c[0].text);
    // a vista: Ana vê as cartas (com a def); Bruno e o espectador, só a contagem, sem refs
    const ana = buildView(tg.g, 0, null).log.find((l) => l.seq === c[0].seq)!;
    expect(ana.refs!.filter((r) => r.k === 'obj').map((r) => r.k === 'obj' && r.def)).toEqual(['Island', 'Forest']);
    for (const quem of [1, null]) {
      const l = buildView(tg.g, quem, null).log.find((x) => x.seq === c[0].seq)!;
      expect(l.text).toBe('Ana compra 2 cartas.');
      expect(l.refs).toBeUndefined();
    }
    // a perda de vida (sem dano) tem linha própria, com a fonte e a vida de agora
    expect(textos(tg, 'vida')).toEqual(['Ana perde 2 de vida com Sign in Blood (agora 38).']);
  });

  it('a compra do turno: uma linha na etapa de compra', () => {
    const tg = detalhado({ battlefield: [[], []], library: [['Island'], ['Forest', 'Plains']] });
    tg.passTo('main1', 1);
    const c = linhas(tg, 'compra').filter((e) => e.actor === 1);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ text: 'Bruno compra Forest.', hiddenText: 'Bruno compra 1 carta.', step: 'draw' });
  });
});

describe('redator: mortes, dano e vida', () => {
  it('Lightning Bolt numa criatura: o dano fora do combate e a morte, com a vítima e o controlador', () => {
    const tg = detalhado({ battlefield: [['Mountain'], ['Viscera Seer']], hand: [['Lightning Bolt'], []], library: [['Island'], ['Island']] });
    tg.choose('qualquer alvo', ['Viscera Seer']).cast('Lightning Bolt').resolve();
    expect(textos(tg, 'dano')).toEqual(['Lightning Bolt causa 3 de dano a Viscera Seer.']);
    const m = linhas(tg, 'morte');
    expect(m.map((e) => e.text)).toEqual(['Viscera Seer morre.']);
    expect(m[0].refs![0]).toMatchObject({ k: 'obj', name: 'Viscera Seer', papel: 'vitima', ctl: 1 });
    // ninguém respondeu: a resolução não ganha linha
    expect(linhas(tg, 'resolve')).toEqual([]);
  });

  it('dano num jogador: uma linha só, com a vida de agora (a perda de vida do dano não repete)', () => {
    const tg = detalhado({ battlefield: [['Mountain'], []], hand: [['Lightning Bolt'], []] });
    tg.choose('qualquer alvo', ['Bruno']).cast('Lightning Bolt').resolve();
    expect(textos(tg, 'dano')).toEqual(['Lightning Bolt causa 3 de dano a Bruno (agora 37).']);
    expect(linhas(tg, 'vida')).toEqual([]);
    expect(linhas(tg, 'dano')[0].refs!.find((r) => r.k === 'jogador')).toMatchObject({ id: 1, papel: 'vitima' });
  });

  it('sacrifício: a linha é de quem sacrificou', () => {
    const tg = detalhado({ battlefield: [['Viscera Seer', 'Wall of Omens'], []], library: [['Island', 'Forest'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.choose('Sacrifique', ['Wall of Omens']).activate('Viscera Seer').resolve();
    expect(linhas(tg, 'morte').map((e) => [e.text, e.actor])).toEqual([['Ana sacrifica Wall of Omens.', 0]]);
  });

  it('Blood Artist: gatilhos da mesma jogada somam numa linha, e a vida também', () => {
    const tg = detalhado({ battlefield: [['Blood Artist', 'Wall of Omens', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [['Winds of Rath'], []] });
    tg.choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']);
    tg.cast('Winds of Rath').resolve();
    tg.resolveAll();
    const mortes = linhas(tg, 'morte');
    expect(mortes).toHaveLength(1);
    expect(mortes[0].text).toBe('Blood Artist, Wall of Omens, Indomitable Ancients são destruídas.');
    // os três gatilhos foram para a pilha juntos
    expect(textos(tg, 'gatilho')).toEqual(['Ana: gatilhos de Blood Artist ×3 vão para a pilha.']);
    // a vida de cada um soma, mesmo resolvendo um por um (são entradas diferentes só no Game; aqui é a mesma)
    expect(textos(tg, 'vida')).toEqual(expect.arrayContaining(['Ana ganha 3 de vida com Blood Artist (3 vezes; agora 43).', 'Bruno perde 3 de vida com Blood Artist (3 vezes; agora 37).']));
  });
});

describe('redator: informação oculta', () => {
  it('criatura virada para baixo: o dano não diz qual é; a morte (que a revela no cemitério) diz, para todos', () => {
    const tg = detalhado({ battlefield: [['Mountain'], ['Ghoulcaller Gisa']], hand: [['Lightning Bolt'], []] });
    const gisa = tg.bf('Ghoulcaller Gisa');
    tg.state.objects[gisa].faceDown = true;
    tg.g.bump();
    tg.choose('qualquer alvo', [gisa]).cast('Lightning Bolt').resolve();
    const dano = linhas(tg, 'dano')[0];
    expect(dano).toMatchObject({ text: 'Lightning Bolt causa 3 de dano a carta virada para baixo.', visibleTo: null });
    for (const quem of [0, null]) expect(JSON.stringify(buildView(tg.g, quem, null).log.find((l) => l.seq === dano.seq))).not.toContain('Gisa');
    const morte = linhas(tg, 'morte')[0];
    expect(morte).toMatchObject({ text: 'Ghoulcaller Gisa morre.', visibleTo: null });
    expect(morte.refs![0]).toMatchObject({ papel: 'vitima', ctl: 1 });
  });
});

describe('redator: fichas', () => {
  it('três fichas iguais: uma linha', () => {
    const tg = detalhado({ battlefield: [["Elspeth, Sun's Champion"], []] });
    tg.activate("Elspeth, Sun's Champion", '+1').resolve();
    const f = linhas(tg, 'ficha');
    expect(f.map((e) => e.text)).toEqual(['Ana cria 3 fichas Soldier.']);
    expect(f[0].refs!.find((r) => r.k === 'obj')).toMatchObject({ name: 'Soldier', id: tg.all('Soldier')[0] });
  });
});

describe('redator: resolução depois de resposta', () => {
  it('a mágica que esperou uma resposta ganha "X resolve."', () => {
    const tg = detalhado({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Lightning Bolt', 'Lightning Bolt'], []] });
    tg.choose('qualquer alvo', ['Bruno']).cast('Lightning Bolt');
    tg.choose('qualquer alvo', ['Bruno']).cast('Lightning Bolt');
    tg.resolve().resolve();
    // o segundo resolve primeiro: a última linha era a conjuração dele, sem linha; o primeiro esperou
    expect(textos(tg, 'resolve')).toEqual(['Lightning Bolt resolve.']);
  });
});
