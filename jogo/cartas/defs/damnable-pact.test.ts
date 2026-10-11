import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const D = 'Damnable Pact';
const pantanos = (n: number) => Array(n).fill('Swamp');

describe(D, () => {
  it('o jogador alvo compra X cartas e perde X de vida', () => {
    const tg = setup({ battlefield: [pantanos(5), []], hand: [[D], []], library: [[], ['Island', 'Plains', 'Forest', 'Mountain']] });
    tg.number('valor de X', 3).choose('jogador alvo', ['Bruno']).cast(D).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Island', 'Plains', 'Forest']);
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(40);
  });
  it('pode mirar você mesmo', () => {
    const tg = setup({ battlefield: [pantanos(4), []], hand: [[D], []], library: [['Island', 'Plains'], []] });
    tg.number('valor de X', 2).choose('jogador alvo', ['Ana']).cast(D).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Plains']);
    expect(tg.life(0)).toBe(38);
  });
  it('com X = 0, nada acontece', () => {
    const tg = setup({ battlefield: [pantanos(2), []], hand: [[D], []], library: [['Island'], []] });
    tg.number('valor de X', 0).choose('jogador alvo', ['Ana']).cast(D).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.life(0)).toBe(40);
  });
});
