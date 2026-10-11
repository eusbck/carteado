import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Medusa, Inhuman Queen';

describe(N, () => {
  it('alcance e vigilância; ganha um marcador +1/+1 quando qualquer jogador conjura uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Forest'], ['Island']], hand: [['Preordain', 'Elvish Mystic'], ['Preordain']], library: [Array(6).fill('Forest'), Array(6).fill('Forest')] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'reach') && hasKw(tg.g, id, 'vigilance')).toBe(true);
    tg.cast('Preordain').resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    // mágica de criatura não conta
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    // a do oponente conta
    tg.passTo('main1', 1);
    tg.cast('Preordain').resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
  });
});
