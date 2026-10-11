import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Springleaf Drum';

describe(N, () => {
  it('vira o Drum e uma criatura sua, mesmo com enjoo de invocação, para uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', ready: false }], []] });
    activateMana(tg, N, 'R');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true);
  });

  it('sem criatura desvirada, não gera mana', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(N))).toBe(false);
  });
});