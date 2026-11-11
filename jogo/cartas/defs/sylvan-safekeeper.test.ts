import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Sylvan Safekeeper";

describe(C, () => {
  it('sacrifica terreno: criatura ganha manto', () => {
    const tg = setup({ battlefield: [[C, 'Forest'], []] });
    tg.choose('criatura alvo', [C]).activate(C).resolve();
    expect(hasKw(tg.g, tg.bf(C), 'shroud')).toBe(true);
  });
});
