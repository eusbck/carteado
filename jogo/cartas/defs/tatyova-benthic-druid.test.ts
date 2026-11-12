import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tatyova, Benthic Druid';

describe(N, () => {
  it('jogando um terreno, ganha 1 de vida e compra uma carta', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []], library: [['Hex'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
  });
  it('terreno do oponente não dispara', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[], ['Forest']], library: [['Hex'], []], active: 1 });
    tg.play('Forest').resolveAll();
    expect(tg.life(0)).toBe(40);
  });
});
