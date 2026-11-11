import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Sabotender";

describe(C, () => {
  it('queda de terreno: 1 de dano', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
