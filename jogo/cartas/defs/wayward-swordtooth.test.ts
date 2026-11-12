import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Wayward Swordtooth';

describe(N, () => {
  it('soma com Exploration: três terrenos no turno', () => {
    const tg = setup({ battlefield: [[N, 'Exploration'], []], hand: [['Forest', 'Forest', 'Forest'], []] });
    tg.play('Forest').play('Forest').play('Forest');
    expect(tg.all('Forest').length).toBe(3);
  });
  it('sem a bênção, não ataca', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.state.players[0].citysBlessing).toBeFalsy();
    tg.attack([[N, 1]]);
    try { tg.passTo('main2', 0); } catch { /* ataque recusado */ }
    expect(tg.life(1)).toBe(40);
  });
  it('com dez permanentes, ganha a bênção e pode atacar', () => {
    const tg = setup({ battlefield: [[N, ...Array(9).fill('Forest')], []] });
    expect(tg.state.players[0].citysBlessing).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
  });
});
