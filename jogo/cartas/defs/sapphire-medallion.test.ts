import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sapphire Medallion';

describe(N, () => {
  it('mágicas azuis custam {1} a menos; as que não são azuis, não', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Fact or Fiction', 'Thran Dynamo'], []] });
    expect(tg.canCast('Thran Dynamo')).toBe(false);
    expect(tg.canCast('Fact or Fiction')).toBe(true);
  });
  it('não reduz mana colorida: Counterspell continua custando {U}{U}', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Island'], ['Forest']], hand: [['Counterspell'], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass();
    expect(tg.canCast('Counterspell')).toBe(false);
  });
  it('reduz o custo de retrospectiva de uma mágica azul', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [['Deep Analysis'], []], library: [['Opt', 'Opt'], []] });
    tg.cast('Deep Analysis', 'flashback').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Opt']);
    expect(tg.names(0, 'exile')).toEqual(['Deep Analysis']);
  });
});
