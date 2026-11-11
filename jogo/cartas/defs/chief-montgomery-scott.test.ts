import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Chief Montgomery Scott';
const terrenos = ['Island', 'Island', 'Island', 'Forest', 'Plains', 'Swamp'];

describe(N, () => {
  it('põe uma criatura da mão no campo com X marcadores +1/+1 (terrenos com nomes diferentes)', () => {
    const tg = setup({ battlefield: [[N, ...terrenos], []], hand: [['Indomitable Ancients'], []] });
    tg.choose('Chief Scott', ['Indomitable Ancients']);
    tg.activate(N).resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([6, 14]);
  });
  it('uma Spacecraft entra com X marcadores de carga', () => {
    const tg = setup({ battlefield: [[N, ...terrenos], []], hand: [['Starship Enterprise'], []] });
    tg.choose('Chief Scott', ['Starship Enterprise']);
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Starship Enterprise')].counters.charge).toBe(4);
  });
});
