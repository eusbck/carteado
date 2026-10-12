import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Folk Hero';

describe(N, () => {
  it('a criatura comandante de que você é dono compra uma carta, uma vez por turno, quando você conjura mágica que compartilha tipo com ela', () => {
    const tg = setup({
      battlefield: [[N, ...Array(6).fill('Forest'), { name: 'Silver Myr', commander: true }], []],
      hand: [['Silver Myr', 'Silver Myr', 'Elvish Mystic'], []], library: [Array(4).fill('Island'), ['Island']],
    });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr', 'Silver Myr']);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr', 'Island']);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});