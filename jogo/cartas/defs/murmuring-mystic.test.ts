import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const N = 'Murmuring Mystic';

describe(N, () => {
  it('conjurando uma instantânea, o gatilho resolve antes dela e cria o Bird Illusion', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Opt'], []], library: [['Plains', 'Swamp'], []] });
    tg.cast('Opt').resolve();
    const ave = tg.bf('Bird Illusion');
    expect(tg.pt(ave)).toEqual([1, 1]);
    expect(hasKw(tg.g, ave, 'flying')).toBe(true);
    expect(tg.find('Opt', 'stack')).not.toBeNull();
  });
});
