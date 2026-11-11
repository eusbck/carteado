import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tireless Tracker';

describe(N, () => {
  it('jogando um terreno, investiga', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.find('Clue')).not.toBeNull();
  });
  it('sacrificando a Clue para comprar, recebe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Forest'], []], library: [['Island', 'Island'], []] });
    tg.play('Forest').resolveAll();
    tg.activate('Clue').resolveAll();
    expect(tg.find('Clue')).toBeNull();
    expect(tg.state.zones.hand[0].length).toBe(1);
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
  });
});
