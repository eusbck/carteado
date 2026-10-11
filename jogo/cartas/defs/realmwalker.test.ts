import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Realmwalker';
const florestas = Array(5).fill('Forest');

describe(N, () => {
  it('conjura do topo do grimório uma criatura do tipo escolhido, no tempo de uma criatura', () => {
    const tg = setup({ battlefield: [florestas, []], hand: [[N], []], library: [['Elvish Mystic', 'Silver Myr', 'Forest'], []] });
    tg.choose('tipo de criatura', ['Elf']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(chars(tg.g, id).subtypes).toEqual(expect.arrayContaining(['Cat', 'Elf']));
    tg.cast('Elvish Mystic', '*').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Silver Myr', 'Forest']);
    // Silver Myr é Myr: não é do tipo escolhido
    expect(tg.canCast('Silver Myr')).toBe(false);
  });

  it('sem tipo escolhido, ou com criatura de outro tipo no topo, nada é conjurado do grimório', () => {
    const tg = setup({ battlefield: [[N, ...florestas], []], library: [['Elvish Mystic'], []] });
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
});
