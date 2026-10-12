import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hatred';

describe(N, () => {
  it('paga X de vida ao conjurar; a criatura alvo recebe +X/+0 até o fim do turno', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Serra Angel'], []], hand: [[N], []] });
    const vida = tg.life(0);
    tg.number('X', 6).choose('criatura alvo', ['Serra Angel']).cast(N);
    expect(tg.life(0)).toBe(vida - 6);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([10, 4]);
  });
});