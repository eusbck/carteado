import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Jarvis, Earth's Mightiest Butler";

describe(N, () => {
  it('compra uma carta sempre que você conjura uma mágica de Hero', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Plains')], []], hand: [['Patriot, Shield Wielder', 'Silver Myr'], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 4]);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Patriot, Shield Wielder']);
    tg.cast('Patriot, Shield Wielder').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});