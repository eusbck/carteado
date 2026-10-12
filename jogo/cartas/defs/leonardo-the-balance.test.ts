import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Leonardo, the Balance';

describe(N, () => {
  it('quando uma ficha sua entra, você pode pôr um marcador +1/+1 em cada criatura sua, uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.yes('Leonardo', true);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Soldier'))).toEqual([2, 2]);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Leonardo')) throw new Error('não devia disparar'); return null; });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });

  it('{W}{U}{B}{R}{G}: as suas criaturas ganham ameaçar, atropelar e vínculo com a vida até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Silver Myr'], []] });
    tg.activate(N).resolveAll();
    for (const kw of ['menace', 'trample', 'lifelink']) expect(hasKw(tg.g, tg.bf('Silver Myr'), kw)).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'menace')).toBe(false);
  });
});