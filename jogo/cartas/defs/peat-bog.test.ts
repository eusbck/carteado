import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Peat Bog';

describe(NOME, () => {
  it('entra virado com dois marcadores de esgotamento', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.play(NOME);
    const o = tg.state.objects[tg.bf(NOME)];
    expect(o.tapped).toBe(true);
    expect(o.counters.depletion).toBe(2);
  });

  it('dá {B}{B}; sem marcadores, é sacrificado', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { depletion: 1 } }], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'));
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
