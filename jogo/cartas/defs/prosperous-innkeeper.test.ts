import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Prosperous Innkeeper';

describe(N, () => {
  it('quando entra, cria um Treasure; quando outra criatura sua entra, você ganha 1 de vida', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.life(0)).toBe(40);
    enterCard(tg, 'Silver Myr', 0);
    enterCard(tg, 'Elvish Mystic', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
  });
});