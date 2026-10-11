import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Oketra's Monument";

describe(N, () => {
  it('qualquer mágica de criatura cria o Warrior; só as brancas custam {1} a menos', () => {
    // Whitemane Lion ({1}{W}) sai com uma Plains só; Silver Myr ({2}) não fica mais barato
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Whitemane Lion', 'Silver Myr'], []] });
    expect(tg.canCast('Silver Myr')).toBe(false);
    expect(tg.canCast('Whitemane Lion')).toBe(true);
    tg.cast('Whitemane Lion');
    // o gatilho resolve antes da criatura
    tg.resolve();
    const [guerreiro] = tg.all('Warrior');
    expect(tg.pt(guerreiro)).toEqual([1, 1]);
    expect(hasKw(tg.g, guerreiro, 'vigilance')).toBe(true);
    expect(tg.find('Whitemane Lion')).toBeNull();
  });

  it('mágica que não é de criatura não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Warrior')).toHaveLength(0);
  });
});
