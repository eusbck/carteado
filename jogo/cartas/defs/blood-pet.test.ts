import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Blood Pet';

describe(NOME, () => {
  it('sacrifica para adicionar {B}, mesmo com enjoo de invocação', () => {
    const tg = setup({ battlefield: [[{ name: NOME, ready: false }], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'));
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
