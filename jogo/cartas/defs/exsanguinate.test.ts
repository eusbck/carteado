import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Exsanguinate', () => {
  it('CR 119.4: pode perder mais vida do que tem; você ganha o total perdido', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(6).fill('Swamp')], [], []], hand: [['Exsanguinate'], [], []] });
    tg.state.players[1].life = 3;
    tg.state.players[2].life = 10;
    tg.number('valor de X', 4).cast('Exsanguinate').resolve();
    expect(tg.life(1)).toBe(-1);
    expect(tg.life(2)).toBe(6);
    expect(tg.life(0)).toBe(48);
    expect(tg.names(0, 'graveyard')).toEqual(['Exsanguinate']);
  });

  it('com X = 0, ninguém perde nem ganha vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Exsanguinate'], []] });
    tg.number('valor de X', 0).cast('Exsanguinate').resolve();
    expect([tg.life(0), tg.life(1)]).toEqual([40, 40]);
  });
});
