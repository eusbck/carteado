import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Underworld Connections';

describe(N, () => {
  it('o terreno encantado ganha "{T}, Pague 1 de vida: Compre uma carta"', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Island'], []], hand: [[N], []], library: [Array(6).fill('Swamp'), []] });
    const ilha = tg.bf('Island');
    tg.choose('terreno', [ilha]).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(ilha);
    tg.activate('Island', 'Pague 1 de vida').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.life(0)).toBe(39);
    expect(tg.state.objects[ilha].tapped).toBe(true);
  });
});
