import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'First Family';
const lib = Array(12).fill('Forest');

describe(N, () => {
  it('conta as cores das suas permanentes e das mágicas que você conjurou no turno, inclusive ela mesma', () => {
    // só terrenos (incolores) no campo: verde e azul da própria First Family
    const tg = setup({ battlefield: [['Forest', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.life(0)).toBe(42);
  });

  it('soma as cores das permanentes (branco) e de outra mágica do turno (preto), sem contar cor repetida', () => {
    // Zetalpa é branca; Hex é preta; Elvish Mystic é verde (já contado)
    const tg = setup({ battlefield: [['Forest', 'Island', 'Island', 'Island', 'Zetalpa, Primal Dawn', 'Elvish Mystic', ...Array(6).fill('Swamp')], []], hand: [[N, 'Dread Summons'], []], library: [lib, lib] });
    tg.number('valor de X', 0).cast('Dread Summons').resolveAll();
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
    expect(tg.life(0)).toBe(44);
  });
});
