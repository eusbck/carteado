import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cut a Deal';
const lib = Array(6).fill('Forest');

describe(N, () => {
  it('cada oponente compra uma carta e você compra uma para cada oponente que comprou', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains'], [], []], hand: [[N], [], []], library: [lib, lib, lib] });
    tg.cast(N).resolveAll();
    expect([0, 1, 2].map((p) => tg.names(p, 'hand').length)).toEqual([2, 1, 1]);
  });

  it('o oponente que não compra (grimório vazio) não conta', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains'], [], []], hand: [[N], [], []], library: [lib, lib, []] });
    tg.cast(N);
    tg.resolve();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });
});
