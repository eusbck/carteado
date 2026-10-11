import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Invincible Hymn';
const planicies = Array(8).fill('Plains');

describe(N, () => {
  it('o seu total de vida passa a ser o número de cartas do seu grimório, ganhando a diferença', () => {
    const tg = setup({ battlefield: [planicies, []], hand: [[N], []], library: [Array(55).fill('Island'), []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(55);
    expect(tg.state.turnStats[0].lifeGained).toBe(15);
  });

  it('com menos cartas no grimório do que vida, você perde a diferença', () => {
    const tg = setup({ battlefield: [planicies, []], hand: [[N], []], library: [Array(12).fill('Island'), []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(12);
    expect(tg.state.turnStats[0].lifeLost).toBe(28);
  });
});