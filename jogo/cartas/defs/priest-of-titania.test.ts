import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Priest of Titania', () => {
  it('conta os Elfos de todos os jogadores, inclusive ela mesma', () => {
    const tg = setup({ battlefield: [['Priest of Titania', 'Llanowar Elves'], ['Elvish Mystic']] });
    const act = tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(tg.bf('Priest of Titania'))))!;
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G', 'G']);
  });
});
