import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rescue, Pepper Potts';

describe(N, () => {
  it('lampejo e voar; ao entrar devolve um artefato ou criatura sua à mão e, se era artefato, ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Arcade Cabinet', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('outro artefato ou criatura alvo que você controla', ['Arcade Cabinet']).cast(N).resolveAll();
    for (const kw of ['flash', 'flying']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Arcade Cabinet']);
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
  });

  it('devolvendo uma criatura que não é artefato, não ganha marcador', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('outro artefato ou criatura alvo que você controla', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
  });
});