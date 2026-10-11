import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Saruman, the White Hand';

describe(N, () => {
  it('reúne Orcs X quando você conjura uma mágica que não é de criatura; os seus Goblins e Orcs têm resguardo {2}', () => {
    const tg = setup({ battlefield: [[N, 'Guttersnipe', 'Elvish Mystic', ...Array(4).fill('Swamp'), 'Forest'], []], hand: [['Languish', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 5]);
    tg.cast('Languish');
    tg.resolve();
    // o gatilho de Guttersnipe e o de Saruman resolvem antes da mágica
    tg.resolve();
    const exercito = tg.bf('Orc Army');
    expect(tg.pt(exercito)).toEqual([4, 4]);
    expect(hasKw(tg.g, exercito, 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Guttersnipe'), 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'ward')).toBe(false);
    tg.resolveAll();
    // mágica de criatura não reúne
    const antes = tg.all('Orc Army').length;
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Orc Army')).toHaveLength(antes);
  });
});
