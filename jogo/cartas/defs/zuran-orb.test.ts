import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Zuran Orb";

describe(C, () => {
  it('sacrifica terreno para ganhar 2', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []] });
    tg.activate(C).resolve();
    expect(tg.life(0)).toBe(42);
  });
});
