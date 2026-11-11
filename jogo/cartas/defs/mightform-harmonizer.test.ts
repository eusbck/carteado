import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mightform Harmonizer";

describe(C, () => {
  it('queda de terreno dobra a força', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []] });
    tg.choose('criatura alvo', [C]).play('Forest').resolveAll();
    expect(tg.pt(tg.bf(C))).toEqual([8, 4]);
  });
});
