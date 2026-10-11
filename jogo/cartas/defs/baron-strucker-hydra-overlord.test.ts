import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Baron Strucker, HYDRA Overlord';
const lib = Array(6).fill('Swamp');

describe(N, () => {
  it('as suas mágicas de Villain custam {1} a menos', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['The Frightful Four'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.canCast('The Frightful Four')).toBe(true);
  });

  it('outro Villain seu que entra pode tramar, só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Hex', 'Hex'], []], library: [lib, lib] });
    tg.yes('Baron Strucker', true).choose('Descarte', ['Hex']);
    const primeiro = enterCard(tg, 'The Frightful Four', 0)!;
    tg.resolveAll();
    expect(tg.state.objects[primeiro].counters['+1/+1']).toBe(1);
    const segundo = enterCard(tg, 'Madame Hydra', 0)!;
    tg.resolveAll();
    expect(tg.state.objects[segundo].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
  });
});
