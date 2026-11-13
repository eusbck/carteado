import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Entish Restoration";

describe(C, () => {
  it('com criatura de força 4, busca três básicos', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest'), 'Rampaging Baloths'], []], hand: [[C], []], library: [['Island', 'Island', 'Swamp'], []] });
    tg.choose('um terreno', ['Forest']).choose('básico', ['Island', 'Island', 'Swamp']).cast(C).resolve();
    expect(tg.all('Island').length + tg.all('Swamp').length).toBe(3);
  });
});
