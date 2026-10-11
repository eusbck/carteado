import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Breach the Multiverse';

describe(N, () => {
  it('cada jogador moi dez cartas; você põe no campo uma criatura ou planeswalker do cemitério de cada um, e as suas criaturas viram Phyrexian', () => {
    const tg = setup({
      battlefield: [[...Array(7).fill('Swamp'), 'Elvish Mystic'], []], hand: [[N], []],
      library: [[...Array(9).fill('Swamp'), 'Silver Myr', 'Swamp'], ['Indomitable Ancients', ...Array(10).fill('Island')]],
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toHaveLength(1);
    expect(tg.names(1, 'library')).toHaveLength(1);
    const anciao = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anciao].controller).toBe(0);
    for (const n of ['Indomitable Ancients', 'Silver Myr', 'Elvish Mystic']) expect(chars(tg.g, tg.bf(n)).subtypes).toContain('Phyrexian');
  });
});
