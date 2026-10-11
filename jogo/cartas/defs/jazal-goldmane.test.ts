import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jazal Goldmane';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('iniciativa; as suas criaturas atacantes recebem +X/+X, onde X é o número de criaturas atacantes', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr', ...Array(5).fill('Plains')], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'first strike')).toBe(true);
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.activate(N, '{3}{W}{W}').resolveAll();
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
    // quem não ataca não recebe
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });

  it('fora do combate, não faz nada', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Plains')], []], library: [lib, lib] });
    tg.activate(N, '{3}{W}{W}').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});
