import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Merciful Mandate';

describe(N, () => {
  it('desvira as suas criaturas; fora do combate, só isso', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', { name: 'Elvish Mystic', tapped: true }], [{ name: 'Wall of Omens', tapped: true }]], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('CR 724.2: no combate, encerra a fase de combate: sem dano, e a mágica é exilada', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Elder Gargaroth', 'Forest']], hand: [[N], []], active: 1 });
    tg.attack([['Elder Gargaroth', 0]]).passTo('declareBlockers');
    tg.pass().yes('encerrar a fase de combate', true);
    tg.cast(N).resolve();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.state.combat).toBeNull();
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
  });
});
