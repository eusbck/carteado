import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Harmonize', () => {
  it('compre três cartas', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Harmonize'], []], library: [['Island', 'Swamp', 'Plains', 'Mountain'], []] });
    tg.cast('Harmonize').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Swamp', 'Plains']);
    expect(tg.names(0, 'graveyard')).toEqual(['Harmonize']);
  });
});
