import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ultimate Nullification';

describe(N, () => {
  it('sacrifica uma criatura lendária, exila todas as criaturas e cemitérios e vai para o fundo do grimório', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Plains'), 'Zetalpa, Primal Dawn', 'Elvish Mystic', 'Sol Ring'], ['Indomitable Ancients']],
      hand: [[N], []], graveyard: [['Preordain'], ['Hex']], library: [Array(3).fill('Forest'), Array(3).fill('Forest')],
    });
    tg.choose('Sacrifique', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Plains')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'exile').sort()).toEqual(['Elvish Mystic', 'Preordain', 'Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'library').at(-1)).toBe(N);
  });

  it('sem criatura lendária para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Plains'), 'Elvish Mystic'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
