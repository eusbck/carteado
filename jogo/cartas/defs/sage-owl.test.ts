import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sage Owl';

describe(N, () => {
  it('ao entrar, olha as quatro do topo e as põe de volta na ordem que quiser', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Island', 'Forest', 'Swamp', 'Plains', 'Mountain'], []] });
    tg.choose('Sage Owl: ponha as cartas', ['Plains', 'Swamp', 'Island', 'Forest']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Island', 'Forest', 'Mountain']);
  });
});
