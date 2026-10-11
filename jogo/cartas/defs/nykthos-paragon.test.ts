import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nykthos Paragon';

describe(N, () => {
  it('depois de colocar os marcadores, outro ganho de vida no turno não dispara mais', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Elvish Mystic']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 6]);
    tg.yes('Nykthos Paragon', true);
    gainLife(tg.g, 0, 3, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([7, 9]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Nykthos Paragon')) throw new Error('não devia disparar'); return null; });
    gainLife(tg.g, 0, 2, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
  });

  it('recusando da primeira vez, o próximo ganho de vida dispara de novo', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    tg.yes('Nykthos Paragon', false);
    gainLife(tg.g, 0, 3, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    tg.yes('Nykthos Paragon', true);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
  });
});