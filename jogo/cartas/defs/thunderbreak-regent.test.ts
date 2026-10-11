import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const T = 'Thunderbreak Regent';
const B = 'Lightning Bolt';

describe(T, () => {
  it('voar; Dragon seu mirado por mágica de oponente: 3 de dano a esse jogador', () => {
    const tg = setup({ active: 1, battlefield: [[T, 'Rapacious Dragon'], ['Mountain']], hand: [[], [B]] });
    expect(hasKw(tg.g, tg.bf(T), 'flying')).toBe(true);
    tg.choose('qualquer alvo', ['Rapacious Dragon']).cast(B).resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.find('Rapacious Dragon')).toBeNull();
  });
  it('o gatilho resolve antes da mágica que mirou', () => {
    const tg = setup({ active: 1, battlefield: [[T], ['Mountain']], hand: [[], [B]] });
    tg.choose('qualquer alvo', [T]).cast(B);
    const bolt = tg.find(B, 'stack')!;
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.life(1)).toBe(37);
    expect(tg.state.zones.stack).toEqual([bolt]);
  });
  it('alvo que não é Dragon, ou mágica sua, não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[T, 'Wall of Omens'], ['Mountain']], hand: [[], [B]] });
    tg.choose('qualquer alvo', ['Wall of Omens']).cast(B);
    expect(tg.state.zones.stack).toHaveLength(1);
    const tg2 = setup({ battlefield: [[T, 'Mountain'], []], hand: [[B], []] });
    tg2.choose('qualquer alvo', [T]).cast(B);
    expect(tg2.state.zones.stack).toHaveLength(1);
  });
  it('habilidade de oponente que mira um Dragon seu também dispara', () => {
    const tg = setup({ active: 1, battlefield: [[T], [...Array(7).fill('Mountain'), 'Unstable Obelisk']] });
    tg.choose('permanente alvo', [T]).activate('Unstable Obelisk', 'Destrua');
    tg.resolve();
    expect(tg.life(1)).toBe(37);
  });
});
