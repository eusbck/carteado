import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw, kwParams } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Lord of the Nazgûl';

describe(N, () => {
  it('voar; cria um Wraith 3/3 com ameaçar a cada instantânea ou feitiço; os seus Wraiths têm proteção contra Portadores do Anel', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Consider'], []], library: [Array(6).fill('Island'), []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 3]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(kwParams(tg.g, id, 'protection')).toContain('ringbearer');
    tg.cast('Consider').resolveAll();
    const ficha = tg.bf('Wraith');
    expect(tg.pt(ficha)).toEqual([3, 3]);
    expect(hasKw(tg.g, ficha, 'menace')).toBe(true);
    expect(kwParams(tg.g, ficha, 'protection')).toContain('ringbearer');
  });

  it('com nove ou mais Wraiths, os seus Wraiths viram 9/9 de base até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Consider'], []], library: [Array(6).fill('Island'), Array(6).fill('Island')] });
    tg.run(createTokens(tg.g, 0, 'Wraith', 7));
    // Lord e sete fichas: oito; a nona chega com a mágica
    tg.cast('Consider').resolveAll();
    expect(tg.all('Wraith')).toHaveLength(8);
    expect(tg.pt(tg.bf(N))).toEqual([9, 9]);
    expect(tg.pt(tg.all('Wraith')[0])).toEqual([9, 9]);
    tg.passTo('main1', 1);
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
  });
});
