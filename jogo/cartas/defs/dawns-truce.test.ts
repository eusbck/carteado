import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Dawn's Truce";

describe(N, () => {
  it('sem presente: as suas permanentes ganham resistência a magia até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Serra Angel'], ['Wall of Omens']], hand: [[N], []], library: [['Island'], ['Island', 'Island']] });
    tg.choose('prometer', ['Não prometer']).cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'hexproof')).toBe(false);
    expect(tg.names(1, 'hand')).toEqual([]);
  });

  it('com o presente prometido, o oponente compra e as suas permanentes ganham também indestrutível', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Serra Angel'], []], hand: [[N], []], library: [['Island'], ['Island', 'Island']] });
    tg.choose('prometer', ['Prometer a Bruno']).cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'indestructible')).toBe(true);
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });
});