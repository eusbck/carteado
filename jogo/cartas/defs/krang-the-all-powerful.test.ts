import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Krang, the All-Powerful';

describe(N, () => {
  it('as habilidades das suas permanentes que disparam por uma compra disparam uma vez a mais, inclusive a do próprio Krang', () => {
    const tg = setup({ battlefield: [[N, 'Baxter, Fly in the Ointment'], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Baxter, Fly in the Ointment'))).toEqual([4, 4]);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Baxter, Fly in the Ointment'))).toEqual([6, 6]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });
});