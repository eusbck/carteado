import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Zuri, Warrior of Wakanda';

describe(N, () => {
  it('atropelar; conjurando um artefato de valor de mana 4 ou maior, cada criatura sua ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', ...Array(4).fill('Island')], ['Elvish Mystic']], hand: [['Thran Dynamo'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.cast('Thran Dynamo').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});