import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Always Watching';

describe(N, () => {
  it('as suas criaturas que não são fichas recebem +1/+1 e vigilância; fichas e criaturas dos oponentes não', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel', { name: 'Spirit 1/1', token: true }], ['Baleful Strix']] });
    const anjo = tg.bf('Segovian Angel');
    expect(tg.pt(anjo)).toEqual([2, 2]);
    expect(hasKw(tg.g, anjo, 'vigilance')).toBe(true);
    const ficha = tg.bf('Spirit');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(hasKw(tg.g, ficha, 'vigilance')).toBe(false);
    expect(tg.pt(tg.bf('Baleful Strix'))).toEqual([1, 1]);
  });
});
