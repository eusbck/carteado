import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Genesis Device";

describe(C, () => {
  it('ao entrar, busca um básico virado', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Forest')], []], hand: [[C], []], library: [['Island'], []] });
    tg.choose('básico', ['Island']).cast(C).resolve().resolveAll();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
