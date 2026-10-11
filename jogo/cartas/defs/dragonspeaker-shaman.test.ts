import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const S = 'Dragonspeaker Shaman';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(S, () => {
  it('mágicas de Dragon que você conjura custam {2} a menos', () => {
    // Rapacious Dragon custa {4}{R}: com o xamã, {2}{R}
    expect(setup({ battlefield: [[S, ...montanhas(2)], []], hand: [['Rapacious Dragon'], []] }).canCast('Rapacious Dragon')).toBe(false);
    const tg = setup({ battlefield: [[S, ...montanhas(3)], []], hand: [['Rapacious Dragon'], []] });
    tg.cast('Rapacious Dragon').resolveAll();
    expect(tg.find('Rapacious Dragon')).not.toBeNull();
  });
  it('CR 601.2f: só a parte genérica — Thunderbreak Regent {2}{R}{R} vira {R}{R}', () => {
    expect(setup({ battlefield: [[S, 'Mountain', 'Plains'], []], hand: [['Thunderbreak Regent'], []] }).canCast('Thunderbreak Regent')).toBe(false);
    expect(setup({ battlefield: [[S, 'Mountain', 'Mountain'], []], hand: [['Thunderbreak Regent'], []] }).canCast('Thunderbreak Regent')).toBe(true);
  });
  it('mágica que não é de Dragon e mágica de Dragon de oponente não ficam mais baratas', () => {
    expect(setup({ battlefield: [[S, 'Mountain'], []], hand: [['Dragon Tempest'], []] }).canCast('Dragon Tempest')).toBe(false);
    expect(setup({ active: 1, battlefield: [[S], montanhas(3)], hand: [[], ['Rapacious Dragon']] }).canCast('Rapacious Dragon')).toBe(false);
  });
});
