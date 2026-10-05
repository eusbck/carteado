import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Towering Titan', () => {
  it('entra com a resistência total das outras; depois de entrar, os marcadores não mudam; sacrificar defensor dá atropelar a todas', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Forest'), 'Wall of Omens', 'Elvish Mystic'], ['Gau, Feral Youth']], hand: [['Towering Titan'], []] });
    tg.cast('Towering Titan').resolve();
    const t = tg.bf('Towering Titan');
    expect(tg.state.objects[t].counters['+1/+1']).toBe(5); // 4 + 1
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.refresh();
    expect(tg.state.objects[t].counters['+1/+1']).toBe(5);
    tg.activate('Towering Titan').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(hasKw(tg.g, t, 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Gau, Feral Youth'), 'trample')).toBe(true);
  });
});
