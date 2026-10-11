import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Fleetfoot Panther';

describe(N, () => {
  it('devolve uma criatura verde ou branca sua, escolhida na resolução', () => {
    // Silver Myr é incolor: não é opção
    const tg = setup({ battlefield: [['Plains', 'Forest', 'Forest', 'Elvish Mystic', 'Silver Myr'], []], hand: [[N], []] });
    tg.choose('Fleetfoot Panther', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    const so = setup({ battlefield: [['Plains', 'Forest', 'Forest', 'Silver Myr'], []], hand: [[N], []] });
    expect(() => so.choose('Fleetfoot Panther', ['Silver Myr']).cast(N).resolveAll()).toThrow();
  });
});
