import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Illuminor Szeras';

describe(N, () => {
  it('{T}, sacrifique outra criatura: adiciona {B} igual ao valor de mana que ela tinha no campo', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('Sacrifique', ['Serra Angel']).activate(N);
    tg.resolve();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B', 'B', 'B']);
  });
});