import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Horizon Explorer';

describe(N, () => {
  it('o terreno que entraria virado entra desvirado', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Mountain Valley'], []] });
    tg.play('Mountain Valley');
    expect(tg.state.objects[tg.bf('Mountain Valley')].tapped).toBe(false);
  });
  it('atacando dois jogadores, cria duas fichas de Lander', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Indomitable Ancients'], [], []] });
    tg.attack([[N, 1], ['Indomitable Ancients', 2]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.all('Lander').length).toBe(2);
  });
});
