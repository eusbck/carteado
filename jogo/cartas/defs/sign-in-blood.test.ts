import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sign in Blood', () => {
  it('você como alvo: compra duas e perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Sign in Blood'], []], library: [['Island', 'Forest', 'Plains'], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Sign in Blood').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']);
    expect(tg.life(0)).toBe(38);
  });

  it('um oponente como alvo: ele compra duas e perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Sign in Blood'], []], library: [['Island'], ['Forest', 'Plains', 'Mountain']] });
    tg.choose('jogador alvo', ['Bruno']).cast('Sign in Blood').resolve();
    expect(tg.names(1, 'hand')).toEqual(['Forest', 'Plains']);
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
