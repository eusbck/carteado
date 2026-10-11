import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Idol of Oblivion';

describe(N, () => {
  it('{T}: compra uma carta, só se você criou uma ficha neste turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.split(':').includes(String(tg.bf(N))))).toBe(false);
    const [ficha] = tg.run(createTokens(tg.g, 0, 'Treasure', 1));
    // a ficha pode até já ter saído do campo
    removeCard(tg, ficha);
    tg.activate(N, 'Compre uma carta').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('{8}, {T}, sacrifique: cria um Eldrazi 10/10 incolor', () => {
    const tg = setup({ battlefield: [[N, ...Array(8).fill('Island')], []] });
    tg.activate(N, 'Eldrazi').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.pt(tg.bf('Eldrazi'))).toEqual([10, 10]);
  });
});