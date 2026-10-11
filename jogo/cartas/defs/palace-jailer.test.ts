import { describe, expect, it } from 'vitest';
import { becomeMonarch } from '../../motor/actions.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Palace Jailer';

describe(N, () => {
  it('Palace Jailer saindo do campo não devolve a criatura; um oponente virando o monarca, sim', () => {
    const tg = setup({ battlefield: [Array(4).fill('Plains'), ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo que um oponente controla', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.state.monarch).toBe(0);
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    becomeMonarch(tg.g, 1);
    tg.refresh().resolveAll();
    const volta = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[volta].controller).toBe(1);
  });
});