import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Strix Serenade';

describe(N, () => {
  it('anula a mágica de criatura do oponente e ele cria um Bird 2/2 azul com voar', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Forest']], hand: [[N], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass().cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.pt(tg.find('Bird', 'battlefield', 1)!)).toEqual([2, 2]);
  });
  it('não mira instantânea', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island']], hand: [[N], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass();
    expect(tg.canCast(N)).toBe(false);
  });
  it('a mágica que não pode ser anulada continua na pilha, mas quem a controla ganha o Bird', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], Array(6).fill('Forest')], hand: [[N], ['Carnage Tyrant']] });
    tg.cast('Carnage Tyrant').pass().cast(N).resolve();
    expect(tg.find('Carnage Tyrant', 'stack')).not.toBeNull();
    expect(tg.find('Bird', 'battlefield', 1)).not.toBeNull();
    tg.resolveAll();
    expect(tg.find('Carnage Tyrant')).not.toBeNull();
  });
});
