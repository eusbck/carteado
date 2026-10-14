import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Angelic Field Marshal';

describe(N, () => {
  it('controlando o seu comandante, recebe +2/+2 e as suas criaturas têm vigilância', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade', { name: 'Giada, Font of Hope', commander: true }], ['Baleful Strix']] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf('Slither Blade'), 'vigilance')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Baleful Strix'), 'vigilance')).toBe(false);
  });

  it('sem o seu comandante no campo, nada muda', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade'], []], command: [['Giada, Font of Hope'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Slither Blade'), 'vigilance')).toBe(false);
  });
});
