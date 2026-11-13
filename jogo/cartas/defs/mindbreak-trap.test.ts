import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mindbreak Trap';

describe(N, () => {
  it('o custo {0} vale com três mágicas conjuradas pelo mesmo oponente, mesmo que tenham resolvido', () => {
    const tg = setup({ active: 1, battlefield: [[], ['Island', 'Island', 'Island']], hand: [[N], ['Opt', 'Opt', 'Brainstorm']], library: [[], Array(8).fill('Forest')] });
    tg.cast('Opt').resolve().cast('Opt').resolve().cast('Brainstorm').pass();
    tg.choose('mágicas alvo', ['Brainstorm']).cast(N, 'armadilha').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Brainstorm']);
  });
  it('três oponentes com uma mágica cada não liberam o custo {0}', () => {
    const tg = setup({ players: 4, battlefield: [[], ['Island'], ['Island'], ['Island']], hand: [[N], [], [], []] });
    for (const p of [1, 2, 3]) tg.state.turnStats[p].spellsCast = 1;
    tg.refresh();
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':armadilha'))).toBe(false);
    tg.state.turnStats[2].spellsCast = 3;
    tg.refresh();
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':armadilha'))).toBe(true);
  });
  it('exila a mágica que não pode ser anulada; pode mirar várias mágicas', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island', 'Island', 'Island'], ['Island', 'Island', 'Chimil, the Inner Sun']], hand: [[N], ['Brainstorm', 'Opt']], library: [[], Array(5).fill('Forest')] });
    tg.cast('Brainstorm').cast('Opt').pass();
    tg.choose('mágicas alvo', ['Brainstorm', 'Opt']).cast(N, 'hand').resolve();
    expect(tg.names(1, 'exile').sort()).toEqual(['Brainstorm', 'Opt']);
  });
});
