import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Canoptek Spyder';

describe(N, () => {
  it('voar; compra quando outra criatura artefato ou Veículo que não é ficha entra sob o seu controle', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Forest')], []], hand: [['Silver Myr', 'Elvish Mystic'], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.cast('Elvish Mystic').resolveAll();
    runEffect(tg, createTokens(tg.g, 0, 'Necron Warrior', 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});