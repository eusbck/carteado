import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shamanic Revelation';

describe(N, () => {
  it('compra uma carta para cada criatura sua e ganha 4 de vida para cada uma com força 4 ou mais', () => {
    // Serra Angel é 4/4; Silver Myr e Indomitable Ancients têm força menor que 4
    const tg = setup({ battlefield: [[...Array(5).fill('Forest'), 'Serra Angel', 'Silver Myr', 'Indomitable Ancients'], ['Serra Angel']], hand: [[N], []], library: [Array(8).fill('Island'), []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.life(0)).toBe(44);
  });
});