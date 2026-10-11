import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Silent Clearing';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'W']));
  it('{T}, pague 1 de vida: {W} ou {B}', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const act = tg.actionIds().find((a) => a.startsWith(`mana:${tg.bf(NOME)}|`))!;
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.life(0)).toBe(39);
    expect(tg.state.players[0].manaPool.length).toBe(1);
  });
  it('{1}, {T}, sacrifique: compre uma carta', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Island'], []] });
    tg.activate(NOME, 'Compre').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(40);
  });
});
