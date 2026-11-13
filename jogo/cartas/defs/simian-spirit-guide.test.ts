import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Simian Spirit Guide';

describe(NOME, () => {
  it('exila da mão para adicionar {R}', () => {
    const tg = setup({ hand: [[NOME], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R']);
    expect(tg.names(0, 'exile')).toEqual([NOME]);
  });

  it('paga uma mágica na hora de pagar o custo', () => {
    const tg = setup({ hand: [[NOME, 'Rite of Flame'], []] });
    tg.cast('Rite of Flame').resolve();
    expect(tg.names(0, 'exile')).toEqual([NOME]);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R', 'R']);
  });

  it('no campo, a habilidade não funciona', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);
  });
});
