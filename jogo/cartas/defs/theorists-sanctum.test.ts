import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Theorist's Sanctum";

describe(N, () => {
  it('sem contemplar um Jace, entra virado; contemplando, entra desvirado', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const tg2 = setup({ battlefield: [[{ name: 'Jace', token: true, counters: { loyalty: 1 } }], []], hand: [[N], []] });
    tg2.choose('Contemplar um Jace', ['Jace (no campo)']).play(N);
    expect(tg2.state.objects[tg2.bf(N)].tapped).toBe(false);
  });
  it('sem ficha de Jace, cria uma com 0 de lealdade e põe dois marcadores', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []] });
    tg.activate(N, 'Fortaleça').resolve();
    const jace = tg.bf('Jace');
    expect(tg.state.objects[jace].counters.loyalty).toBe(2);
  });
  it('com uma ficha de Jace sua, os marcadores vão para ela em vez de criar outra', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', { name: 'Jace', token: true, counters: { loyalty: 1 } }], []] });
    tg.activate(N, 'Fortaleça').resolve();
    expect(tg.all('Jace')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Jace')].counters.loyalty).toBe(3);
  });
});
