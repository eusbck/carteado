import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'End-Raze Forerunners';

describe(NOME, () => {
  it('as outras criaturas que você controla recebem +2/+2, vigilância e atropelar; as que chegam depois não', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Forest'), 'Wall of Omens'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([2, 6]);
    expect(hasKw(tg.g, w, 'trample')).toBe(true);
    expect(hasKw(tg.g, w, 'vigilance')).toBe(true);
    expect(tg.pt(tg.bf(NOME))).toEqual([7, 7]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    const [s] = tg.run(createTokens(tg.g, 0, 'Squirrel', 1));
    expect(tg.pt(s)).toEqual([1, 1]);
  });
});
