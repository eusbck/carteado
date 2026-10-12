import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Baxter, Fly in the Ointment';

describe(N, () => {
  it('ao entrar, as suas criaturas com marcador ganham voar; cada carta que você compra põe um marcador +1/+1 nele', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), { name: 'Silver Myr', counters: { '+1/+1': 1 } }, 'Elvish Mystic'], []], hand: [[N], []], library: [['Island', 'Island'], ['Island']] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'flying')).toBe(false);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});