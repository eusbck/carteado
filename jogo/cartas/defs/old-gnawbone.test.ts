import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const O = 'Old Gnawbone';

describe(O, () => {
  it('cada criatura sua que causa dano de combate a um jogador cria essa quantidade de Tesouros', () => {
    const tg = setup({ battlefield: [[O, 'Indomitable Ancients'], []], library: [['Island'], ['Island']] });
    tg.attack([[O, 1], ['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(31);
    expect(tg.names(0, 'battlefield').filter((x) => x === 'Treasure').length).toBe(9);
  });
});
