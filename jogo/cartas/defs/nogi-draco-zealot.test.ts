import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Nogi, Draco-Zealot';

describe(N, () => {
  it('as mágicas de Dragon que você conjura custam {1} a menos; as outras não', () => {
    // Rapacious Dragon custa {4}{R}: com Nogi, quatro Mountains bastam
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Rapacious Dragon', 'Wall of Omens'], []] });
    expect(tg.canCast('Rapacious Dragon')).toBe(true);
    const sem = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Rapacious Dragon'], []] });
    expect(sem.canCast('Rapacious Dragon')).toBe(false);
    // o desconto não vale para o oponente
    const dele = setup({ active: 1, battlefield: [[N], ['Mountain', 'Mountain', 'Mountain', 'Mountain']], hand: [[], ['Rapacious Dragon']] });
    expect(dele.canCast('Rapacious Dragon')).toBe(false);
  });

  it('CR 603.4: atacando com três ou mais Dragons, vira um Dragon 5/5 com voar até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Goldspan Dragon', 'Rapacious Dragon', 'Shimmer Dragon'], []] });
    const id = tg.bf(N);
    const antes = tg.pt(id);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(chars(tg.g, id).subtypes).toEqual(['Dragon']);
    expect(chars(tg.g, id).supertypes).toContain('Legendary');
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.pt(id)).toEqual(antes);
    expect(chars(tg.g, id).subtypes).not.toContain('Dragon');
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });

  it('com menos de três Dragons, o gatilho não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Goldspan Dragon', 'Rapacious Dragon'], []] });
    const id = tg.bf(N);
    const antes = tg.pt(id);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.pt(id)).toEqual(antes);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });
});
