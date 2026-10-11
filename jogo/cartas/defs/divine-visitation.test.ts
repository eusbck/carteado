import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Divine Visitation';

describe(N, () => {
  it('as fichas de criatura que você criaria viram Angels 4/4 com voar e vigilância; as outras fichas, não', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 2));
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(tg.find('Soldier')).toBeNull();
    const anjos = tg.all('Angel');
    expect(anjos).toHaveLength(2);
    expect(tg.pt(anjos[0])).toEqual([4, 4]);
    expect(hasKw(tg.g, anjos[0], 'flying')).toBe(true);
    expect(hasKw(tg.g, anjos[0], 'vigilance')).toBe(true);
    expect(tg.all('Treasure')).toHaveLength(1);
    // as fichas do oponente não mudam
    runEffect(tg, createTokens(tg.g, 1, 'Soldier', 1));
    expect(tg.all('Soldier')).toHaveLength(1);
  });
});