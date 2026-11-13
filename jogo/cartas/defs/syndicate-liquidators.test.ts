import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Syndicate Liquidators';

describe(N, () => {
  it('jogando um terreno, põe dois marcadores +1/+1 na criatura alvo sua', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Wall of Omens']], hand: [['Forest'], []] });
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']);
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });
});
