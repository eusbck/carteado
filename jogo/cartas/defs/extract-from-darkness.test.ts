import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Extract from Darkness';

describe(N, () => {
  it('cada jogador moi duas cartas e você põe no campo uma criatura de qualquer cemitério, inclusive uma recém-moída', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [['Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Island', 'Island']] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toHaveLength(1);
    expect(tg.names(1, 'library')).toHaveLength(1);
    const anciao = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anciao].controller).toBe(0);
    expect(tg.state.objects[anciao].owner).toBe(1);
  });
});
