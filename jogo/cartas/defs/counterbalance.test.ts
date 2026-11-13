import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Counterbalance';

describe(N, () => {
  it('revela a carta do topo; com o mesmo valor de mana, anula a mágica do oponente', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest']], hand: [[], ['Elvish Mystic']], library: [['Opt'], []] });
    tg.yes('Counterbalance: revelar', true).cast('Elvish Mystic').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'library')).toEqual(['Opt']);
  });
  it('com valor de mana diferente, a mágica resolve', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest']], hand: [[], ['Elvish Mystic']], library: [['Counterspell'], []] });
    tg.yes('Counterbalance: revelar', true).cast('Elvish Mystic').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
  it('na pilha o valor de mana inclui o X; a carta revelada com X vale 0', () => {
    // Earthquake com X=1 tem valor de mana 2: Counterspell (2) anula; Earthquake revelado (1) não anula
    const tg = setup({ active: 1, battlefield: [[N], ['Mountain', 'Mountain']], hand: [[], ['Earthquake']], library: [['Counterspell'], []] });
    tg.yes('Counterbalance: revelar', true).number('valor de X', 1).cast('Earthquake').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Earthquake']);
    expect(tg.life(1)).toBe(40);
    const tg2 = setup({ active: 1, battlefield: [[N], ['Mountain', 'Mountain']], hand: [[], ['Earthquake']], library: [['Earthquake'], []] });
    tg2.yes('Counterbalance: revelar', true).number('valor de X', 1).cast('Earthquake').resolveAll();
    expect(tg2.life(1)).toBe(39);
  });
});
