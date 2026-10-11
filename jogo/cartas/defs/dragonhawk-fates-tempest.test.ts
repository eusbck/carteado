import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Dragonhawk, Fate's Tempest";
const Z = 'Zetalpa, Primal Dawn';
const montanhas = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'];
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('ao entrar, exila X cartas (criaturas suas com força 4 ou mais); as jogadas não contam e as que sobram causam 2 de dano cada na sua etapa final', () => {
    // Zetalpa (4/8) e o próprio Dragonhawk (5/5): X = 2; o Elvish Mystic não conta
    const tg = setup({ players: 3, battlefield: [[...montanhas, Z, 'Elvish Mystic'], [], []], hand: [[N], [], []], library: [['Island', 'Sol Ring', 'Plains', ...forests], forests, forests] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Island', 'Sol Ring']);
    tg.play('Island');
    expect(tg.find('Island')).not.toBeNull();
    tg.passTo('end', 0);
    tg.resolveAll();
    // sobrou uma carta exilada (Sol Ring): 2 de dano a cada oponente
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 38, 38]);
    // a permissão acabou na etapa final: no turno seguinte a carta não pode mais ser jogada
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    expect(tg.canCast('Sol Ring')).toBe(false);
  });

  it('atacando no turno seguinte, exila de novo e cada gatilho conta só as cartas dele', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Plains', ...forests], forests] });
    // Dragonhawk sozinho: X = 1 a cada ataque
    tg.attack([[N, 1]]).passTo('end', 0);
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    // 5 de combate + 2 da carta que sobrou
    expect(tg.life(1)).toBe(40 - 5 - 2);
    tg.passTo('main1', 1);
    tg.attack([[N, 1]]).passTo('end', 0);
    tg.resolveAll();
    // o segundo gatilho conta só a carta exilada por ele (uma), não o Sol Ring do turno anterior
    expect(tg.names(0, 'exile')).toHaveLength(2);
    expect(tg.life(1)).toBe(33 - 5 - 2);
  });

  it('sem criatura com força 4 ou mais, não exila nada e não causa dano', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '-1/-1': 2 } }], []], library: [['Sol Ring', ...forests], forests] });
    tg.attack([[N, 1]]).passTo('end', 0);
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual([]);
    expect(tg.life(1)).toBe(40 - 3);
  });
});
