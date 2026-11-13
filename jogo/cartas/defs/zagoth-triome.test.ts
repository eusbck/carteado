import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Zagoth Triome";

describe(C, () => {
  it('entra virada', () => {
    const tg = setup({ hand: [[C], []] });
    tg.play(C);
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
  });
});
