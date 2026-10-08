import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { createTokens } from '../../motor/api.ts';

describe('Boros Charm', () => {
  it('modo 1: 4 de dano ao jogador alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Boros Charm'], []] });
    tg.choose('modo', ['Causa 4 de dano ao jogador ou planeswalker alvo']).choose('jogador ou planeswalker', ['Bruno']).cast('Boros Charm').resolve();
    expect(tg.life(1)).toBe(36);
  });
  it('indestrutível só para os permanentes que você controla na resolução', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Boros Charm'], []] });
    tg.choose('modo', ['Permanentes que você controla ganham indestrutível até o fim do turno']).cast('Boros Charm').resolve();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
    const [novo] = tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(hasKw(tg.g, novo, 'indestructible')).toBe(false);
  });
  it('modo 3: golpe duplo para a criatura alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Wall of Omens'], []], hand: [['Boros Charm'], []] });
    tg.choose('modo', ['A criatura alvo ganha golpe duplo até o fim do turno']).choose('criatura alvo', ['Wall of Omens']).cast('Boros Charm').resolve();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(true);
  });
});
