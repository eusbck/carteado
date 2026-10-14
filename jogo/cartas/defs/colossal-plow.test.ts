import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Colossal Plow';

describe(N, () => {
  it('ao atacar, adiciona {W}{W}{W} que dura até o fim do turno e você ganha 3 de vida', () => {
    const tg = setup({ battlefield: [[N, 'Gigantosaurus'], []] });
    tg.choose('Tripular:', ['Gigantosaurus']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(0)).toBe(43);
    expect(tg.life(1)).toBe(34);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['W', 'W', 'W']);
  });
});
