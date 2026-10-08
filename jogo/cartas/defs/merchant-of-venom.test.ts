import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Merchant of Venom', () => {
  it('cada jogador sacrifica; ela pode sacrificar a si mesma', () => {
    const tg = setup({
      players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Elvish Mystic'], ['Gau, Feral Youth', 'Glissa Sunslayer']], hand: [['Merchant of Venom'], [], []],
    });
    tg.choose('Sacrifique', ['Wall of Omens']).choose('Sacrifique', ['Gau, Feral Youth']);
    tg.cast('Merchant of Venom').resolve().resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Gau, Feral Youth')).toBeNull();
    expect(tg.pt(tg.bf('Merchant of Venom'))).toEqual([4, 4]);
  });
});
