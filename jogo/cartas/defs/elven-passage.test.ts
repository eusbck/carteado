import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Elven Passage';

describe(N, () => {
  it('busca um básico virado; contemplando um Elf, desvira-o', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Reclaimer'], []], library: [['Forest'], []] });
    tg.choose('terreno básico', ['Forest']).choose('Contemplar', ['Elvish Reclaimer (no campo)']).activate(N).resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
  it('sem contemplar, o terreno fica virado', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Elvish Reclaimer'], []], library: [['Forest'], []] });
    tg.choose('terreno básico', ['Forest']).choose('Contemplar', []).activate(N).resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
