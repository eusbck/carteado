import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Carnivorous Cultivator // Enroot";

describe(C, () => {
  it('entra preparada com toque mortífero', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []] });
    tg.cast(C, '*').resolve();
    expect(hasKw(tg.g, tg.bf('Carnivorous Cultivator'), 'deathtouch')).toBe(true);
  });
});
