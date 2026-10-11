import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Decree of Pain';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('destrói todas as criaturas e compra uma carta para cada criatura destruída; a indestrutível fica e não conta', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Swamp'), 'Elvish Mystic'], ['Silver Myr', 'Zetalpa, Primal Dawn']], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('ciclando, todas as criaturas recebem -2/-2 antes de você comprar a carta', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.activate(N, 'Ciclagem');
    tg.resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Elvish Mystic'].sort());
  });
});
