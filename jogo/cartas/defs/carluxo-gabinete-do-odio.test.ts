import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Carluxo, Gabinete do Ódio';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('vira e incita a criatura alvo de um oponente', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Indomitable Ancients'], []], library: [lib, lib, lib] });
    tg.choose('criatura alvo que um oponente controla', ['Indomitable Ancients']);
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
  });
});
