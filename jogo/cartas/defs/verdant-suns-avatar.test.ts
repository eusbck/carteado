import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = "Verdant Sun's Avatar";

describe(N, () => {
  it('a resistência é vista na resolução, também a da própria Avatar', () => {
    const tg = fixture({ battlefield: [[...Array(7).fill('Forest')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(45);
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(55);
    // criatura do oponente não conta
    enterCard(tg, 'Indomitable Ancients', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(55);
  });
});
