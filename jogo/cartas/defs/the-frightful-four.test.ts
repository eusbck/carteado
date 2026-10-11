import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'The Frightful Four';

describe(N, () => {
  it('ameaçar; o oponente perde vida igual ao valor de mana da primeira mágica que não é de criatura dele no turno', () => {
    const tg = setup({ active: 1, battlefield: [[N], [...Array(8).fill('Swamp')]], hand: [[], ['Elvish Mystic', 'Hex', 'Sol Ring']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'menace')).toBe(true);
    // Hex ({4}{B}{B}) precisa de seis alvos; usa-se Sol Ring ({1}) depois de uma criatura, que não conta
    const forest = setup({ active: 1, battlefield: [[N], ['Forest', 'Island', 'Island']], hand: [[], ['Elvish Mystic', 'Sol Ring', 'Sol Ring']] });
    forest.cast('Elvish Mystic').resolveAll();
    expect(forest.life(1)).toBe(40);
    forest.cast('Sol Ring').resolveAll();
    expect(forest.life(1)).toBe(39);
    forest.cast('Sol Ring').resolveAll();
    expect(forest.life(1)).toBe(39);
  });

  it('as suas próprias mágicas não disparam', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.life(0)).toBe(40);
  });
});
