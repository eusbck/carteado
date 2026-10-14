import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Cyberdrive Awakener';

describe(N, () => {
  it('ao entrar, os artefatos que não são criaturas viram criaturas 4/4 voadoras até o fim do turno', () => {
    const tg = fixture({ battlefield: [['Sol Ring', 'Gold Myr', 'Ripjaw Raptor', ...Array(6).fill('Island')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const anel = tg.bf('Sol Ring');
    expect(chars(tg.g, anel).types).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(anel)).toEqual([4, 4]);
    expect(hasKw(tg.g, anel, 'flying')).toBe(true);
    // o Gold Myr já era criatura: continua 1/1, mas voa
    expect(tg.pt(tg.bf('Gold Myr'))).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.bf('Gold Myr'), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Ripjaw Raptor'), 'flying')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, anel).types).toEqual(['Artifact']);
  });
});
