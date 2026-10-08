import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

describe('Demon of Catastrophes', () => {
  it('sacrifica exatamente uma criatura ao conjurar; tem voar e atropelar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens', 'Elvish Mystic'], []], hand: [['Demon of Catastrophes'], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']).cast('Demon of Catastrophes');
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.find('Demon of Catastrophes', 'stack')).not.toBeNull();
    tg.resolve();
    const d = tg.bf('Demon of Catastrophes');
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(hasKw(tg.g, d, 'flying')).toBe(true);
    expect(hasKw(tg.g, d, 'trample')).toBe(true);
    expect(tg.pt(d)).toEqual([6, 6]);
  });
  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Demon of Catastrophes'], []] });
    expect(tg.canCast('Demon of Catastrophes')).toBe(false);
  });
});
