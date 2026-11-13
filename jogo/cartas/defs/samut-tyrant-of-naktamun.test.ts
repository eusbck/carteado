import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Samut, Tyrant of Naktamun';

describe(N, () => {
  it('com a mágica com segundo dividido na pilha, o oponente só tem habilidades de mana e passar', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Island', 'Island', 'Grim Monolith']], hand: [['Opt'], ['Counterspell']], library: [['Ponder', 'Forest'], []] });
    tg.cast('Opt').pass();
    expect(tg.pending?.player).toBe(1);
    const acoes = tg.actionIds();
    expect(acoes.some((a) => a.startsWith('cast:') || a.startsWith('act:'))).toBe(false);
    expect(acoes.some((a) => a.startsWith('mana:'))).toBe(true);
  });
  it('mágica de criatura sua não ganha segundo dividido', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], ['Island', 'Island']], hand: [['Elvish Mystic'], ['Counterspell']] });
    tg.cast('Elvish Mystic').pass();
    expect(tg.canCast('Counterspell')).toBe(true);
  });
  it('gatilhos disparam e vão para a pilha normalmente', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Rhystic Study']], hand: [['Opt'], []], library: [['Ponder', 'Forest'], []] });
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(2);
  });
  it('o que já estava na pilha continua lá; depois que a mágica sai da pilha, todos podem conjurar de novo', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Island'], ['Island', 'Island', 'Island']], hand: [['Opt'], ['Brainstorm', 'Counterspell']], library: [['Ponder', 'Forest'], Array(5).fill('Forest')] });
    tg.cast('Brainstorm').pass().cast('Opt');
    // com o Opt na pilha, o oponente não pode anular nada
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    tg.pass();
    // o Opt resolveu; o Brainstorm continua na pilha e o oponente já pode conjurar
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
    expect(tg.find('Brainstorm', 'stack')).not.toBeNull();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Counterspell')).toBe(true);
  });
});
