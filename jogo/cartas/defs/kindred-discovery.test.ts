import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Kindred Discovery';

describe(N, () => {
  it('escolhe um tipo ao entrar; compra quando uma criatura sua desse tipo entra e para cada uma que ataca', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Island'), 'Serra Angel', 'Silver Myr'], []], hand: [[N], []], library: [Array(4).fill('Island'), ['Island']] });
    tg.choose('escolha um tipo de criatura', ['Angel']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].choices.creatureType).toBe('Angel');
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.attack([['Serra Angel', 1], ['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('sem tipo escolhido, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []], library: [['Island', 'Island'], ['Island']] });
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});