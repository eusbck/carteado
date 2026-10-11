import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Moria Scavenger';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('{T}, descartar: compra uma carta; se a descartada era criatura, reúne Orcs 1', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Elvish Mystic'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 4]);
    expect(hasKw(tg.g, id, 'deathtouch') && hasKw(tg.g, id, 'haste')).toBe(true);
    tg.choose('Descarte', ['Elvish Mystic']).activate(N, 'Descarte uma carta').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Mountain']);
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([1, 1]);
  });

  it('descartando carta que não é de criatura, só compra', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Languish'], []], library: [lib, lib] });
    tg.choose('Descarte', ['Languish']).activate(N, 'Descarte uma carta').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Mountain']);
    expect(tg.all('Orc Army')).toHaveLength(0);
  });
});
