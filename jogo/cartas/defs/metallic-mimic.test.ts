import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Metallic Mimic';

describe(N, () => {
  it('é do tipo escolhido; outra criatura sua desse tipo entra com um marcador +1/+1 a mais, as de outro tipo não', () => {
    const tg = setup({ battlefield: [Array(4).fill('Forest'), []], hand: [[N, 'Silver Myr'], []] });
    tg.choose('escolha um tipo de criatura', ['Myr']).cast(N).resolveAll();
    const mimic = tg.bf(N);
    expect(tg.pt(mimic)).toEqual([2, 1]);
    expect(chars(tg.g, mimic).subtypes).toEqual(expect.arrayContaining(['Shapeshifter', 'Myr']));
    tg.cast('Silver Myr').resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    expect(tg.pt(tg.bf('Soldier'))).toEqual([1, 1]);
  });
});