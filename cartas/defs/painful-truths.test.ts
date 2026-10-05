import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Painful Truths', () => {
  it('três cores gastas, três cartas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Island', 'Mountain'], []], hand: [['Painful Truths'], []], library: [['Plains', 'Plains', 'Plains', 'Plains'], []] });
    tg.cast('Painful Truths').resolve();
    expect(tg.names(0, 'hand').length).toBe(3);
    expect(tg.life(0)).toBe(37);
  });
  it('uma cor só, uma carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Painful Truths'], []], library: [['Plains', 'Plains'], []] });
    tg.cast('Painful Truths').resolve();
    expect(tg.names(0, 'hand').length).toBe(1);
    expect(tg.life(0)).toBe(39);
  });
});
