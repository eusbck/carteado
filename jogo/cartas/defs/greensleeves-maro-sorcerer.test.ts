import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Greensleeves, Maro-Sorcerer';

describe(N, () => {
  it('jogando um terreno, cria um Badger 3/3 e Greensleeves cresce', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], ['Forest']], hand: [['Forest'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Badger'))).toEqual([3, 3]);
  });
  it('vale também fora do campo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    expect(tg.pt(tg.find(N, 'hand')!)).toEqual([3, 3]);
  });
  it('proteção contra planeswalkers e contra Wizards', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    expect(kwParams(tg.g, tg.bf(N), 'protection').sort()).toEqual(['subtype:Wizard', 'type:Planeswalker']);
  });
});
