import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Champion of Dusk';

describe(N, () => {
  it('X conta os Vampires que você controla na resolução, inclusive ele mesmo', () => {
    const tg = setup({ battlefield: [['Vampire Nighthawk', 'Elvish Mystic'], ['Vampire Nighthawk']], library: [Array(6).fill('Swamp'), []] });
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.life(0)).toBe(38);
  });
});
