import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Olivia's Wrath";

describe(N, () => {
  it('cada criatura que não é Vampire recebe -X/-X, onde X é o número de Vampires que você controla', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Vampire Nighthawk', 'Stromkirk Condemned', 'Elvish Mystic'], ['Indomitable Ancients', 'Vampire Nighthawk', 'Silver Myr']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    // dois Vampires seus: -2/-2
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Indomitable Ancients', 'Vampire Nighthawk']);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 1))).toEqual([2, 3]);
  });
});
