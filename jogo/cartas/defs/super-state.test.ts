import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Super State';

describe(N, () => {
  it('a encantada vira 9/9 com voar, iniciativa, atropelar e ímpeto; o dano de combate a um oponente se repete nos outros', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(7).fill('Plains'), 'Silver Myr'], [], []], hand: [[N], [], []] });
    tg.choose('criatura que você controla', ['Silver Myr']).cast(N).resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([9, 9]);
    for (const kw of ['flying', 'first strike', 'trample', 'haste']) expect(hasKw(tg.g, myr, kw)).toBe(true);
    const [a, b] = [tg.life(1), tg.life(2)];
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect([tg.life(1), tg.life(2)]).toEqual([a - 9, b - 9]);
  });
});