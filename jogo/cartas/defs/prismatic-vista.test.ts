import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Prismatic Vista";

describe(C, () => {
  it('busca um básico desvirado', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Forest'], []] });
    tg.choose('básico', ['Forest']).activate(C).resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
    expect(tg.life(0)).toBe(39);
  });
});
