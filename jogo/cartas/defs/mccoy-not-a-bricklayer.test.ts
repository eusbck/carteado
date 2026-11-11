import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const N = 'McCoy, Not a Bricklayer';
const terrenos = ['Forest', 'Forest', 'Forest', 'Forest', 'Plains'];

describe(N, () => {
  it('ao entrar, põe um marcador em cada criatura sua, e as com marcadores têm vínculo com a vida', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf(N))).toEqual([1, 5]);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'lifelink')).toBe(false);
  });
  it('outro Doctor seu entrando dispara de novo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Christine Chapel, Combat Medic'], []] });
    tg.cast('Christine Chapel, Combat Medic').resolveAll();
    // McCoy 0/4 + 1; sem marcador antes, a criatura sem marcador não tem vínculo
    expect(tg.pt(tg.bf(N))).toEqual([1, 5]);
  });
});
