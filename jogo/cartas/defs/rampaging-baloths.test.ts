import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rampaging Baloths';

describe(N, () => {
  it('jogando um terreno, cria uma Beast 4/4 verde', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.bf('Beast'))).toEqual([4, 4]);
  });
});
