import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Captain America, Team Leader';

describe(N, () => {
  it('outro Hero seu que entra ganha vigilância e ímpeto e um marcador +1/+1; Captain America ganha outro', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Plains')], []], hand: [['Patriot, Shield Wielder', 'Silver Myr'], []] });
    tg.cast('Patriot, Shield Wielder').resolveAll();
    const p = tg.bf('Patriot, Shield Wielder');
    expect(tg.pt(p)).toEqual([3, 3]);
    for (const kw of ['vigilance', 'haste']) expect(hasKw(tg.g, p, kw)).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});