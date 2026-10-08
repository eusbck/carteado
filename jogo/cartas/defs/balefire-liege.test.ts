import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Balefire Liege', () => {
  it('criatura vermelha e branca recebe +2/+2; só branca, +1/+1', () => {
    const tg = setup({ battlefield: [['Balefire Liege', 'Killian, Ink Duelist'], []] });
    tg.run(createTokens(tg.g, 0, 'Spirit 3/2', 1));
    expect(tg.pt(tg.bf('Spirit'))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Killian, Ink Duelist'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Balefire Liege'))).toEqual([2, 4]);
  });
  it('mágica vermelha: 3 de dano ao jogador alvo; branca: ganha 3', () => {
    const tg = setup({ battlefield: [['Balefire Liege', 'Mountain', 'Mountain', 'Plains'], ['Sol Ring', 'Wall of Omens']], hand: [['Abrade', 'Swords to Plowshares'], []] });
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']).choose('jogador ou planeswalker', ['Bruno']);
    tg.cast('Abrade').resolveAll();
    expect(tg.life(1)).toBe(37);
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Swords to Plowshares').resolveAll();
    expect(tg.life(0)).toBe(43);
  });
});
