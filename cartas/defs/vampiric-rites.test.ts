import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Vampiric Rites', () => {
  it('{1}{B}, sacrifique uma criatura: ganha 1 e compra', () => {
    const tg = setup({ battlefield: [['Vampiric Rites', 'Elvish Mystic', 'Swamp', 'Swamp'], []], library: [['Island'], []] });
    tg.activate('Vampiric Rites').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
