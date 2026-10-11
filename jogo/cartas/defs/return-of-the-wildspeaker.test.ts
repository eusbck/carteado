import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Return of the Wildspeaker';
const lib = Array(10).fill('Forest');
const campo = [...Array(5).fill('Forest'), 'Elvish Mystic', 'Keeper of Fables', 'Spellbinding Soprano'];

describe(N, () => {
  it('compra cartas iguais à maior força entre as suas criaturas não Humanas', () => {
    const tg = setup({ battlefield: [campo, []], hand: [[N], []], library: [lib, lib] });
    tg.choose('modo', ['Compre cartas iguais à maior força entre as criaturas não Humanas que você controla']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
  });

  it('as suas criaturas não Humanas recebem +3/+3; a Humana não', () => {
    const tg = setup({ battlefield: [campo, ['Elvish Mystic']], hand: [[N], []], library: [lib, lib] });
    tg.choose('modo', ['As criaturas não Humanas que você controla recebem +3/+3 até o fim do turno']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic', 0))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Keeper of Fables'))).toEqual([7, 8]);
    const soprano = tg.bf('Spellbinding Soprano');
    expect(tg.pt(soprano)[0]).toBeLessThan(4);
    expect(tg.pt(tg.bf('Elvish Mystic', 1))).toEqual([1, 1]);
  });
});
