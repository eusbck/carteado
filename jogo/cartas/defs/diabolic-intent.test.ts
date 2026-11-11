import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Diabolic Intent";

describe(C, () => {
  it('sacrifica uma criatura e busca uma carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [[C], []], library: [['Opt', 'Sol Ring'], []] });
    tg.choose('Procure', ['Sol Ring']).cast(C).resolve();
    expect(tg.names(0, 'hand')).toContain('Sol Ring');
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
