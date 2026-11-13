import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Amanda Grayson, Logic's Link";

describe(N, () => {
  it('CR 702.41a: custa {1} a menos para cada Vulcan que você controla', () => {
    // Commander Spock e T'Pring são Vulcans: {3}{G} vira {1}{G}
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Commander Spock', "T'Pring, Never Parted"], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    const sem = setup({ battlefield: [['Forest', 'Forest', 'Commander Spock'], []], hand: [[N], []] });
    expect(sem.canCast(N)).toBe(false);
  });
  it('jogando um terreno, põe dois marcadores +1/+1 na criatura alvo sua', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
  });
});
