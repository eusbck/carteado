import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const M = 'Maelstrom of the Spirit Dragon';

describe(M, () => {
  it('a mana colorida só paga mágica de Dragon', () => {
    // Dragon Whelp ({2}{R}{R}): Maelstrom paga um {R}
    const tg = setup({ battlefield: [[M, 'Mountain', 'Sol Ring'], []], hand: [['Dragon Whelp'], []] });
    expect(tg.canCast('Dragon Whelp')).toBe(true);
    const tg2 = setup({ battlefield: [[M], []], hand: [['Elvish Mystic'], []] });
    expect(tg2.canCast('Elvish Mystic')).toBe(false);
  });
  it('a mana colorida paga mágica de presságio', () => {
    // Coil and Catch ({3}{U}) é a face de presságio de Marang River Regent: o {U} vem do Maelstrom
    const MR = 'Marang River Regent // Coil and Catch // Marang River Regent';
    const tg = setup({ battlefield: [[M, 'Sol Ring', 'Mountain'], []], hand: [[MR], []], library: [['Island', 'Plains', 'Swamp', 'Forest'], []] });
    tg.choose('Descarte', ['Island']).cast(MR, 'hand@1').resolve();
    expect(tg.state.objects[tg.bf(M)].tapped).toBe(true);
    expect(tg.find(MR, 'library', 0)).not.toBeNull();
  });
  it('{4}, {T}, sacrifique: procura uma carta de Dragon e a põe na mão', () => {
    const tg = setup({ battlefield: [[M, 'Sol Ring', 'Sol Ring'], []], library: [['Island', 'Dragon Whelp'], []] });
    tg.choose('carta de Dragon', ['Dragon Whelp']).activate(M, 'Procure').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Dragon Whelp']);
    expect(tg.find(M, 'graveyard', 0)).not.toBeNull();
  });
});
