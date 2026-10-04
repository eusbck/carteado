import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Millikin', () => {
  it('CR 605.1a: mói como custo, usa a pilha e adiciona {C} ao resolver', () => {
    const tg = setup({ battlefield: [['Millikin'], []], library: [['Plains'], []] });
    tg.activate('Millikin');
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });
  it('não pode ser ativado com o grimório vazio (CR 701.17b)', () => {
    const tg = setup({ battlefield: [['Millikin'], []], library: [[], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
