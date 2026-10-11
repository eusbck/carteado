import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Summons of Saruman';

describe(N, () => {
  it('reúne Orcs X, moi X cartas e conjura de graça uma instantânea ou feitiço de valor X ou menos entre elas', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Consider', 'Languish', 'Island', 'Sol Ring', 'Swamp', 'Swamp'], []] });
    tg.number('valor de X', 3).choose('Summons of Saruman', ['Consider']).yes('Conjurar Consider', true);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([3, 3]);
    // moeu Consider, Languish e Island; Consider foi conjurada (vigiar 1 e comprar)
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Consider', 'Island', 'Languish'].sort());
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('Languish (valor 4) não pode ser conjurada com X = 3', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [[N], []], library: [['Languish', 'Island', 'Island', 'Swamp'], []] });
    tg.number('valor de X', 3);
    tg.cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Languish');
  });

  it('retrospectiva: X é o número de cartas exiladas do seu cemitério', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island'], []], graveyard: [[N, 'Swamp', 'Island'], []], library: [['Swamp', 'Swamp', 'Swamp'], []] });
    tg.choose('exile X cartas', ['Swamp', 'Island']);
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([2, 2]);
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', N, 'Swamp'].sort());
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });
});
