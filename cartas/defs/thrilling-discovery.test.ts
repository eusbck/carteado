import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Thrilling Discovery', () => {
  it('ganha 2; descartando duas, compra três', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Thrilling Discovery', 'Island', 'Swamp'], []], library: [['Plains', 'Plains', 'Plains'], []] });
    tg.yes('descartar duas', true).cast('Thrilling Discovery').resolve();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains', 'Plains']);
  });
  it('com menos de duas cartas na mão, só ganha a vida', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Thrilling Discovery', 'Island'], []], library: [['Plains', 'Plains', 'Plains'], []] });
    tg.cast('Thrilling Discovery').resolve();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
