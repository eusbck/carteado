import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tunneling Geopede', () => {
  it('jogar um terreno dispara a aterragem', () => {
    const tg = setup({ players: 3, battlefield: [['Tunneling Geopede'], [], []], hand: [['Mountain'], [], []] });
    tg.play('Mountain').resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
  });
});
