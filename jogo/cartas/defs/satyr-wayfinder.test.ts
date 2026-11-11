import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Satyr Wayfinder';

describe(N, () => {
  it('põe um terreno das quatro do topo na mão e o resto no cemitério', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Sol Ring', 'Island', 'Wall of Omens', 'Forest', 'Plains'], []] });
    tg.choose('Satyr Wayfinder', ['Island']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Sol Ring', 'Wall of Omens']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
