import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Bitter Triumph';

describe(N, () => {
  it('pagando 3 de vida, destrói a criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('custo adicional', ['pagar 3 de vida']).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(37);
  });

  it('descartando uma carta, destrói o planeswalker alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Jace, Architect of Thought']], hand: [[N, 'Island'], []] });
    tg.choose('custo adicional', ['descartar uma carta']).choose('criatura ou planeswalker alvo', ['Jace, Architect of Thought']).cast(N).resolve();
    expect(tg.find('Jace, Architect of Thought')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(expect.arrayContaining(['Island', N]));
    expect(tg.life(0)).toBe(40);
  });
});
