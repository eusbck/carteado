import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Necron Monolith';

describe(N, () => {
  it('voar e indestrutível; tripulado e atacando, tritura três cartas e cria um Necron Warrior para cada criatura triturada', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []], library: [['Silver Myr', 'Island', 'Elvish Mystic', 'Island'], ['Island']] });
    for (const kw of ['flying', 'indestructible']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    tg.choose('Tripular:', ['Serra Angel']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'graveyard')).toHaveLength(3);
    expect(tg.all('Necron Warrior')).toHaveLength(2);
  });
});