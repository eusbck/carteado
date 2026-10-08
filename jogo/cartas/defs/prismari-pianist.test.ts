import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Prismari Pianist', () => {
  it('instantânea ou feitiço: uma ficha Elemental 1/1', () => {
    const tg = setup({ battlefield: [['Prismari Pianist', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolve();
    expect(tg.all('Elemental').length).toBe(1);
  });
  it('X conta no valor de mana da mágica na pilha: com 5 ou mais, três fichas', () => {
    const tg = setup({ battlefield: [['Prismari Pianist', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Pest Infestation'], []] });
    tg.number('valor de X', 2).choose('artefatos e/ou encantamentos', []).cast('Pest Infestation').resolve();
    expect(tg.all('Elemental').length).toBe(3);
  });
});
