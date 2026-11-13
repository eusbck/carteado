import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Elvish Archdruid', () => {
  it('os outros Elfos seus recebem +1/+1 e a mana conta todos os seus Elfos', () => {
    const tg = setup({ battlefield: [['Elvish Archdruid', 'Llanowar Elves'], ['Elvish Mystic']] });
    expect(tg.pt(tg.bf('Llanowar Elves'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Archdruid'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    const act = tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(tg.bf('Elvish Archdruid'))))!;
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G']);
  });
});
