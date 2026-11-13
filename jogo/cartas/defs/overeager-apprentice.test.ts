import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Overeager Apprentice';

describe(NOME, () => {
  it('descarta uma carta e se sacrifica para adicionar {B}{B}{B}', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Island'], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'));
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', NOME].sort());
  });

  it('sem carta para descartar, não dá para ativar', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);
  });
});
