import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Dread Summons';

describe(N, () => {
  it('cada jogador mói X; uma ficha de Zombie 2/2 virada para cada carta de criatura que foi para um cemitério', () => {
    const tg = setup({
      players: 3, battlefield: [Array(5).fill('Swamp'), [], []], hand: [[N], [], []],
      library: [['Elvish Mystic', 'Plains', 'Sol Ring', 'Forest'], ['Wall of Omens', 'Silver Myr', 'Indomitable Ancients', 'Forest'], ['Island', 'Island', 'Island', 'Island']],
    });
    tg.number('valor de X', 3).cast(N).resolveAll();
    // três cartas de cada grimório
    expect([0, 1, 2].map((p) => tg.state.zones.library[p].length)).toEqual([1, 1, 1]);
    // criaturas moídas: 1 sua, 3 de Bruno, 0 de Carla
    const zumbis = tg.all('Zombie 2/2');
    expect(zumbis).toHaveLength(4);
    expect(zumbis.every((id) => tg.state.objects[id].tapped && tg.state.objects[id].controller === 0)).toBe(true);
    expect(tg.pt(zumbis[0])).toEqual([2, 2]);
    expect(chars(tg.g, zumbis[0]).colors).toEqual(['B']);
  });

  it('com X = 0, ninguém mói e nenhuma ficha é criada', () => {
    const tg = setup({ battlefield: [Array(2).fill('Swamp'), []], hand: [[N], []], library: [['Elvish Mystic'], ['Elvish Mystic']] });
    tg.number('valor de X', 0).cast(N).resolveAll();
    expect(tg.all('Zombie 2/2')).toHaveLength(0);
    expect(tg.state.zones.library[0]).toHaveLength(1);
  });
});
