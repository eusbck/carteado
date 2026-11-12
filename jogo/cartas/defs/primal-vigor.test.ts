import { describe, expect, it } from 'vitest';
import { addCounters, createTokens } from '../../motor/actions.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

describe('Primal Vigor', () => {
  it('dobra as fichas e os marcadores +1/+1 de qualquer jogador', () => {
    const tg = setup({ battlefield: [['Primal Vigor'], ['Elvish Mystic']] });
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Treasure').length).toBe(2);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Elvish Mystic') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(2);
  });
  it('com duas Primal Vigor, quatro vezes', () => {
    const tg = setup({ battlefield: [['Primal Vigor', 'Primal Vigor', 'Llanowar Elves'], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(tg.all('Treasure').length).toBe(4);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Llanowar Elves') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(4);
  });
});
