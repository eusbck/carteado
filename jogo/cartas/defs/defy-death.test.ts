import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Defy Death';
const planicies = Array(5).fill('Plains');

describe(N, () => {
  it('devolve um Angel com dois marcadores +1/+1; outra criatura sem marcadores', () => {
    const tg = setup({ battlefield: [planicies, []], hand: [[N], []], graveyard: [['Segovian Angel'], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Segovian Angel')].counters['+1/+1']).toBe(2);
    const tg2 = setup({ battlefield: [planicies, []], hand: [[N], []], graveyard: [['Slither Blade'], []] });
    tg2.cast(N).resolveAll();
    expect(tg2.state.objects[tg2.bf('Slither Blade')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
