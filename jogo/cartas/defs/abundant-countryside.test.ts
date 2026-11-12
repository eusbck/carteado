import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Abundant Countryside';

describe(N, () => {
  it('a mana colorida só paga mágica de criatura', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Llanowar Elves', 'Sol Ring'], []] });
    expect(tg.canCast('Sol Ring')).toBe(true); // com {C}
    tg.cast('Llanowar Elves').resolve();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
  });
  it('a ficha criada é de todos os tipos de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.activate(N, 'Metamorfo').resolve();
    const ficha = tg.bf('Shapeshifter');
    expect(chars(tg.g, ficha).subtypes).toEqual(expect.arrayContaining(['Elf', 'Halfling']));
  });
});
