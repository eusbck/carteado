import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const UB = 'Up the Beanstalk';

describe(UB, () => {
  it('ao entrar compra uma carta; e quando você conjura mágica de valor 5 ou mais', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []],
      hand: [[UB, 'Dragon Whelp', 'Crux of Fate'], []], library: [['Island', 'Plains', 'Swamp'], []],
    });
    tg.cast(UB).resolve().resolve();
    expect(tg.names(0, 'hand')).toContain('Island');
    // Dragon Whelp (valor 4): nada
    tg.cast('Dragon Whelp');
    expect(tg.state.zones.stack.length).toBe(1);
  });
  it('mágica de valor 5 dispara', () => {
    const tg = setup({
      battlefield: [[UB, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []],
      hand: [['Crux of Fate'], []], library: [['Island'], []],
    });
    tg.choose('modo', ['Destrua todas as criaturas Dragon']).cast('Crux of Fate');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
