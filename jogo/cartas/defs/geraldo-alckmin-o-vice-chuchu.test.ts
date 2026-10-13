import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Geraldo Alckmin, o Vice Chuchu';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('sem atacar no turno, compra uma carta na etapa final', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('se você atacou com uma criatura, não compra', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('upkeep', 1);
    expect(tg.life(1)).toBe(39);
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});
