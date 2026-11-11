import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Swan Song';

describe(N, () => {
  it('anula a mágica instantânea do oponente e ele cria um Bird 2/2 azul com voar', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island']], hand: [[N], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass().cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Brainstorm']);
    const bird = tg.find('Bird', 'battlefield', 1)!;
    expect(bird).not.toBeNull();
    expect(tg.pt(bird)).toEqual([2, 2]);
    expect(chars(tg.g, bird).colors).toEqual(['U']);
  });
  it('não mira mágica de criatura nem de artefato', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Forest', 'Mountain']], hand: [[N], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass();
    expect(tg.canCast(N)).toBe(false);
  });
  it('a mágica que não pode ser anulada continua na pilha, mas quem a controla ganha o Bird', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island', 'Chimil, the Inner Sun']], hand: [[N], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass().cast(N).resolve();
    expect(tg.find('Brainstorm', 'stack')).not.toBeNull();
    expect(tg.find('Bird', 'battlefield', 1)).not.toBeNull();
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Brainstorm']);
  });
});
