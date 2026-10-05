import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Stensian Sanguinist // Exsanguinate', () => {
  it('a criatura alvo ganha toque mortífero; ao causar dano de combate a um jogador, prepara; Exsanguinate drena', () => {
    const tg = setup({
      players: 3, battlefield: [[{ name: 'Stensian Sanguinist // Exsanguinate', ready: true }, { name: 'Gau, Feral Youth', ready: true }, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], [], []],
      library: [['Island'], ['Island'], ['Island']],
    });
    tg.choose('criatura alvo', ['Gau, Feral Youth']);
    tg.attack([['Gau, Feral Youth', 1]]).passTo('declareAttackers').resolveAll();
    expect(hasKw(tg.g, tg.bf('Gau, Feral Youth'), 'deathtouch')).toBe(true);
    tg.passTo('main2');
    const s = tg.bf('Stensian Sanguinist');
    expect(tg.state.objects[s].prepared).toBe(true);
    tg.number('valor de X', 2);
    tg.cast('Exsanguinate', 'prepared').resolve();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([44, 35, 38]);
  });
});
