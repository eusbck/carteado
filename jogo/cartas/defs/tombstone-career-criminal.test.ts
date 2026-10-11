import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tombstone, Career Criminal';

describe(N, () => {
  it('ao entrar, devolve uma carta de Villain do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['The Frightful Four', 'Elvish Mystic'], []] });
    tg.choose('carta de Villain alvo', ['The Frightful Four']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(tg.names(0, 'hand')).toEqual(['The Frightful Four']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });

  it('as suas mágicas de Villain custam {1} a menos; as outras não', () => {
    // The Frightful Four custa {3}{B}: com Tombstone, três Swamps bastam
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['The Frightful Four', 'Hex'], []] });
    expect(tg.canCast('The Frightful Four')).toBe(true);
    const sem = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['The Frightful Four'], []] });
    expect(sem.canCast('The Frightful Four')).toBe(false);
    // Silver Myr ({2}) não é Villain: uma Swamp só não basta
    const myr = setup({ battlefield: [[N, 'Swamp'], []], hand: [['Silver Myr'], []] });
    expect(myr.canCast('Silver Myr')).toBe(false);
  });
});
