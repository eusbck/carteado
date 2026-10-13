import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Maria do Rosário';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('a criatura que causa dano de combate a você é virada e recebe dois marcadores de atordoamento', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(39);
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.state.objects[elfo].tapped).toBe(true);
    expect(tg.state.objects[elfo].counters.stun).toBe(2);
  });

  it('dano de combate a outro jogador não conta', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters.stun ?? 0).toBe(0);
  });
});
