import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Crop Rotation';

describe(N, () => {
  it('sacrifica um terreno ao conjurar e põe uma carta de terreno do grimório no campo, desvirada', () => {
    const tg = setup({ battlefield: [['Forest', 'Island'], []], hand: [[N], []], library: [['Hex', 'Strip Mine'], []] });
    tg.choose('Sacrifique', ['Island']).choose('Crop Rotation', ['Strip Mine']).cast(N);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Strip Mine')].tapped).toBe(false);
  });
  it('sem terreno para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
