import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lumra, Bellow of the Woods';

describe(N, () => {
  it('mói quatro e devolve todas as cartas de terreno do cemitério, viradas, também as que já estavam lá', () => {
    const tg = setup({
      battlefield: [Array<string>(6).fill('Forest'), []], hand: [[N], []],
      graveyard: [['Swamp', 'Hex'], []], library: [['Island', 'Hex', 'Mountain', 'Sol Ring', 'Plains'], []],
    });
    tg.cast(N).resolveAll();
    for (const n of ['Swamp', 'Island', 'Mountain']) expect(tg.state.objects[tg.bf(n)].tapped, n).toBe(true);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Hex', 'Hex', 'Sol Ring']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.pt(tg.bf(N))).toEqual([9, 9]);
  });
  it('vale também fora do campo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []] });
    expect(tg.pt(tg.find(N, 'hand')!)).toEqual([2, 2]);
  });
});
