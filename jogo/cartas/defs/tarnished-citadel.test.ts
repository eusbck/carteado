import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Tarnished Citadel';

describe(NOME, () => {
  it('{C} sem dano; mana colorida causa 3 de dano a você', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Dark Ritual'], []] });
    tg.cast('Dark Ritual').resolve();
    expect(tg.life(0)).toBe(37);
    const tg2 = setup({ battlefield: [[NOME], []] });
    const acao = tg2.actionIds().find((a) => a.startsWith('mana:') && a.endsWith('|0'));
    tg2.answer({ kind: 'priority', action: acao! });
    tg2.settle();
    expect(tg2.state.players[0].manaPool.map((m) => m.type)).toEqual(['C']);
    expect(tg2.life(0)).toBe(40);
  });
});
