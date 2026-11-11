import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Force of Negation';

describe(N, () => {
  it('fora do seu turno, exilando uma carta azul da mão, anula a mágica não criatura e a exila', () => {
    const tg = setup({ active: 1, battlefield: [[], ['Island']], hand: [[N, 'Opt'], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass().cast(N, 'forca').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Brainstorm']);
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'exile')).toEqual(['Opt']);
  });
  it('no seu turno, só pagando o custo de mana', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Sol Ring'], []], hand: [[N, 'Opt', 'Ponder'], []] });
    tg.cast('Ponder');
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':forca'))).toBe(false);
    tg.cast(N, 'hand').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Ponder']);
  });
  it('não mira mágica de criatura', () => {
    const tg = setup({ active: 1, battlefield: [[], ['Forest']], hand: [[N, 'Opt'], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass();
    expect(tg.canCast(N)).toBe(false);
  });
  it('se a mágica não pode ser anulada, ela fica na pilha e não é exilada', () => {
    const tg = setup({ active: 1, battlefield: [[], ['Island', 'Chimil, the Inner Sun']], hand: [[N, 'Opt'], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass().cast(N, 'forca').resolve();
    expect(tg.find('Brainstorm', 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Brainstorm']);
  });
});
