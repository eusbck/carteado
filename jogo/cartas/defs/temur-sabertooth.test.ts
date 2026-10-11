import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Temur Sabertooth';

describe(N, () => {
  it('devolvendo outra criatura sua, ganha indestrutível; sem devolver, não ganha', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...Array(4).fill('Forest')], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 3]);
    tg.choose('Temur Sabertooth', ['Nenhuma']);
    tg.activate(N, '{1}{G}').resolveAll();
    expect(hasKw(tg.g, id, 'indestructible')).toBe(false);
    tg.script.length = 0;
    tg.choose('Temur Sabertooth', ['Elvish Mystic']);
    tg.activate(N, '{1}{G}').resolveAll();
    expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
  });
});
