import { describe, expect, it } from 'vitest';
import { controllerOf, dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Hellkite Tyrant';

describe(C, () => {
  it('dano de combate a um jogador: ganha o controle dos artefatos dele', () => {
    const tg = setup({ battlefield: [[C], ['Basilisk Collar', 'Darksteel Plate', 'Elvish Mystic']] });
    dealDamage(tg.g, [{ source: tg.bf(C), target: { kind: 'player', id: 1 }, amount: 6, combat: true }]);
    tg.refresh().settle();
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Basilisk Collar'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Darksteel Plate'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Elvish Mystic'))).toBe(1);
  });
  it('ruling 1: com menos de vinte artefatos não dispara; com vinte, vence', () => {
    const tg = setup({ battlefield: [[C, ...Array(19).fill({ name: 'Treasure', token: true })], []], library: [['Opt', 'Opt'], ['Opt', 'Opt']], active: 1, step: 'main2' });
    tg.passTo('draw', 0);
    expect(tg.state.gameOver).toBeFalsy();
    const tg2 = setup({ battlefield: [[C, ...Array(20).fill({ name: 'Treasure', token: true })], []], library: [['Opt', 'Opt'], ['Opt', 'Opt']], active: 1, step: 'main2' });
    tg2.passUntil((t) => !!t.state.gameOver);
    expect(tg2.state.gameOver?.winners).toEqual([0]);
  });
});
