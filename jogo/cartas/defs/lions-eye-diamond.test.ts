import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Lion's Eye Diamond";

describe(NOME, () => {
  it('descarta a mão e se sacrifica para adicionar três manas de uma cor', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Island', 'Forest'], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:') && a.endsWith('|2'));
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', NOME].sort());
  });

  it('é habilidade de mana, mas não pode ser ativada enquanto se paga uma mágica', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Dark Ritual'], []] });
    expect(tg.canCast('Dark Ritual')).toBe(false);
  });
});
