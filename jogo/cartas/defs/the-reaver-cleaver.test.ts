import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Reaver Cleaver';

describe(N, () => {
  it('a equipada recebe +1/+1 e atropelar; ao causar dano de combate a um jogador, cria essa quantidade de Tesouros', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }], []], step: 'beginCombat' });
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([2, 2]);
    expect(hasKw(tg.g, myr, 'trample')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure').length).toBe(2);
  });
});
