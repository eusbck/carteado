import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Magmatic Insight';

describe(N, () => {
  it('descarta uma carta de terreno e compra duas', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[N, 'Forest', "Night's Whisper"], []], library: [['Island', 'Plains'], []] });
    tg.cast(N).resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', N].sort());
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', "Night's Whisper", 'Plains'].sort());
  });
  it('sem carta de terreno na mão, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[N, "Night's Whisper"], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
