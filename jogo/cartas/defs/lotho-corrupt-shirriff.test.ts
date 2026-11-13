import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lotho, Corrupt Shirriff';

describe(N, () => {
  it('o próprio Lotho conta como a primeira mágica; a segunda dispara', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Island', 'Island'], []], hand: [[N, 'Sol Ring', 'Lotus Petal'], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Treasure')).toHaveLength(1);
    tg.cast('Lotus Petal').resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Treasure')).toHaveLength(1);
  });

  it('a segunda mágica de um oponente também dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Lotus Petal', 'Sol Ring']] });
    tg.cast('Lotus Petal').resolveAll();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});
