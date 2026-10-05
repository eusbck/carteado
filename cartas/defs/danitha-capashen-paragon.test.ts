import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Danitha Capashen, Paragon', () => {
  it('Auras e Equipamentos custam {1} a menos', () => {
    const tg = setup({ battlefield: [['Danitha Capashen, Paragon', 'Plains'], []], hand: [['Angelic Gift', 'Swiftfoot Boots'], []] });
    expect(tg.canCast('Angelic Gift')).toBe(true);
    expect(tg.canCast('Swiftfoot Boots')).toBe(true);
  });
  it('outras mágicas não', () => {
    const tg = setup({ battlefield: [['Danitha Capashen, Paragon', 'Plains'], []], hand: [['Wall of Omens'], []] });
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
});
