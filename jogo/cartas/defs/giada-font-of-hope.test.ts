import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Giada, Font of Hope';

describe(N, () => {
  it('conta os Angels que você já controla, inclusive Giada, e não o que está entrando', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel', 'Slither Blade'], ['Youthful Valkyrie']] });
    const novo = enterCard(tg, 'Inspiring Overseer', 0)!;
    tg.resolveAll();
    // Giada e Segovian Angel: dois marcadores
    expect(tg.state.objects[novo].counters['+1/+1']).toBe(2);
    // outra criatura que não é Angel não ganha
    const blade = enterCard(tg, 'Triton Shorestalker', 0)!;
    expect(tg.state.objects[blade].counters['+1/+1'] ?? 0).toBe(0);
    // o Angel de outro jogador também não
    const doBruno = enterCard(tg, 'Segovian Angel', 1)!;
    expect(tg.state.objects[doBruno].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('a mana só paga mágica de Angel', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Segovian Angel'], []] });
    expect(tg.canCast('Segovian Angel')).toBe(true);
    // Fateful Absence ({1}{W}) com Giada e uma Plains: a mana de Giada não serve
    const tg2 = setup({ battlefield: [[N, 'Plains'], []], hand: [['Fateful Absence'], []] });
    expect(tg2.canCast('Fateful Absence')).toBe(false);
  });
});
