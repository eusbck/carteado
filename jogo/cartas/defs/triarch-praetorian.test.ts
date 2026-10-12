import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Triarch Praetorian';

describe(N, () => {
  it('voar; desenterrada, entra vinda do cemitério: você compra duas cartas e perde 2 de vida', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], graveyard: [[N], []], library: [Array(3).fill('Island'), ['Island']] });
    const vida = tg.life(0);
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.life(0)).toBe(vida - 2);
  });
});