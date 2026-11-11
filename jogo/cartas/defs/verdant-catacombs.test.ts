import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Verdant Catacombs";

describe(C, () => {
  it('paga 1 de vida e busca um Swamp ou Forest', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Forest', 'Island'], []] });
    tg.choose('Swamp ou Forest', ['Forest']).activate(C).resolveAll();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.life(0)).toBe(39);
  });
});
