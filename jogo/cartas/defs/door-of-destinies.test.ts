import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Door of Destinies';

describe(N, () => {
  it('conjurar uma mágica do tipo escolhido põe um marcador de carga; a criatura já entra com o bônus', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Forest'), 'Elvish Mystic'], []], hand: [[N, 'Silver Myr', 'Silver Myr'], []] });
    tg.choose('escolha um tipo de criatura', ['Myr']).cast(N).resolveAll();
    tg.cast('Silver Myr').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(1);
    tg.cast('Silver Myr').resolveAll();
    for (const id of tg.all('Silver Myr')) expect(tg.pt(id)).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});