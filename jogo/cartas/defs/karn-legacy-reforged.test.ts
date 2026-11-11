import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Karn, Legacy Reforged';

describe(C, () => {
  it('P/R igual ao maior valor de mana entre os artefatos; mana na manutenção', () => {
    const tg = setup({ battlefield: [[C, 'Sol Ring'], []], library: [['Opt'], ['Opt']], step: 'untap' });
    expect(tg.pt(tg.bf(C))).toEqual([5, 5]);
    tg.passTo('upkeep').resolveAll();
    expect(tg.state.players[0].manaPool.length).toBe(2);
  });
});
