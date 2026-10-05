import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Soul Snuffers', () => {
  it('põe um marcador nela mesma também', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Elvish Mystic']], hand: [['Soul Snuffers'], []] });
    tg.cast('Soul Snuffers').resolve().resolveAll();
    expect(tg.pt(tg.bf('Soul Snuffers'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
