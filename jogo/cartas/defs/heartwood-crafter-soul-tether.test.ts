import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Heartwood Crafter // Soul Tether";

describe(C, () => {
  it('entra preparada', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [[C], []] });
    tg.cast(C, '*').resolve();
    expect(tg.state.objects[tg.bf('Heartwood Crafter')].prepared).toBe(true);
  });
});
