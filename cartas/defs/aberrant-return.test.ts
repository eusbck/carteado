import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Aberrant Return', () => {
  it('criaturas de qualquer cemitério voltam sob seu controle com um marcador -1/-1', () => {
    const tg = setup({ battlefield: [Array(6).fill('Swamp'), []], graveyard: [['Wall of Omens'], ['Indomitable Ancients']], hand: [['Aberrant Return'], []], library: [['Island'], []] });
    tg.choose('cartas de criatura alvo', ['Wall of Omens', 'Indomitable Ancients']).cast('Aberrant Return').resolve().resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens', 0))).toEqual([-1, 3]);
    expect(tg.pt(tg.bf('Indomitable Ancients', 0))).toEqual([1, 9]);
  });
});
