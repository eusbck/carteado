import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Necropolis Regent';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('voar; a criatura sua que causa dano de combate a um jogador recebe esse número de marcadores +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.pt(id)).toEqual([12, 11]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
  });
});
