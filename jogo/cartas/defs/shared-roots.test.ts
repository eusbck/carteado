import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Shared Roots";

describe(C, () => {
  it('busca um básico virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []], library: [['Island'], []] });
    tg.choose('básico', ['Island']).cast(C).resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
