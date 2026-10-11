import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Vanquisher's Banner";

describe(N, () => {
  it('as suas criaturas do tipo escolhido recebem +1/+1 e conjurar uma delas compra uma carta', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Forest'), 'Elvish Mystic', 'Silver Myr'], ['Elvish Mystic']], hand: [[N, 'Elvish Mystic', 'Silver Myr'], []], library: [Array(4).fill('Forest'), []] });
    tg.choose('tipo de criatura', ['Elf']).cast(N).resolveAll();
    expect(tg.pt(tg.all('Elvish Mystic').find((id) => tg.state.objects[id].controller === 0)!)).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Elvish Mystic', 1))).toEqual([1, 1]);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr', 'Forest']);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
