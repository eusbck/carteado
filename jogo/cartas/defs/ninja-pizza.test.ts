import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ninja Pizza';

describe(N, () => {
  it('na sua segunda fase principal cria um Food; os seus Foods podem ser sacrificados por uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('main2', 0).resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
    activateMana(tg, 'Food', 'U');
    expect(tg.all('Food')).toHaveLength(0);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['U']);
  });
});