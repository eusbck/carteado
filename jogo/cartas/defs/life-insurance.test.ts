import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Life Insurance', () => {
  it('extorquir: paga {W/B} na resolução, cada oponente perde 1 e você ganha o total', () => {
    const tg = setup({ players: 3, battlefield: [['Life Insurance', 'Plains', 'Swamp'], [], []], hand: [['Sol Ring'], [], []] });
    tg.yes('extorquir', true);
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(2)).toBe(39);
    expect(tg.life(0)).toBe(42);
    expect(tg.find('Sol Ring', 'stack')).not.toBeNull();
  });

  it('sempre que uma criatura que não é ficha morre, você perde 1 de vida e cria um Treasure; ficha não conta', () => {
    const tg = setup({ battlefield: [['Life Insurance', 'Plains', 'Plains', 'Plains', 'Plains', 'Island'], ['Wall of Omens', { name: 'Angel', token: true }]], hand: [['Time Wipe'], []] });
    tg.yes('extorquir', false);
    tg.cast('Time Wipe');
    while (tg.state.zones.stack.length) tg.resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});
