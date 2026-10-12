import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aettir and Priwen';

describe(N, () => {
  it('a equipada tem força e resistência base iguais à sua vida, e acompanha as mudanças', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', counters: { '+1/+1': 1 } }], []] });
    attach(tg.g, tg.bf(N), tg.bf('Silver Myr'));
    tg.state.players[0].life = 20;
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([21, 21]);
    tg.state.players[0].life = 7;
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([8, 8]);
  });
});