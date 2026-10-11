import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mirror Entity';
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('as suas criaturas viram X/X de base, com marcadores somando por cima, e ganham todos os tipos de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Indomitable Ancients', ...Array(3).fill('Plains')], ['Elvish Mystic']], library: [lib, lib] });
    const elfo = tg.bf('Elvish Mystic', 0);
    addCounters(tg.g, { kind: 'obj', id: elfo }, '+1/+1', 1, 0);
    tg.number('valor de X', 3).activate(N, '{X}').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(elfo)).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 3]);
    expect(chars(tg.g, elfo).subtypes).toEqual(expect.arrayContaining(['Cat', 'Dog', 'Elf']));
    expect(tg.pt(tg.bf('Elvish Mystic', 1))).toEqual([1, 1]);
    tg.passTo('main1', 1);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });

  it('com X igual a 0, as suas criaturas viram 0/0 e morrem', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic']], library: [lib, lib] });
    tg.number('valor de X', 0).activate(N, '{X}').resolveAll();
    expect(tg.names(0, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'battlefield')).toEqual(['Elvish Mystic']);
  });
});
