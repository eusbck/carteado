import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vampire Nighthawk';

describe(N, () => {
  it('2/3 com voar, toque mortífero e vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(6).fill('Swamp'), Array(6).fill('Swamp')] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    for (const kw of ['flying', 'deathtouch', 'lifelink']) expect(hasKw(tg.g, id, kw)).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
});
