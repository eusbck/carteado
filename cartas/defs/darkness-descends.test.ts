import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Darkness Descends', () => {
  it('dois marcadores -1/-1 em cada criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Elvish Mystic', 'Indomitable Ancients']], hand: [['Darkness Descends'], []] });
    tg.cast('Darkness Descends').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
