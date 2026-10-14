import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Curious Altisaur';

describe(N, () => {
  it('cada Dinosaur seu que causa dano de combate a um jogador compra uma carta; outra criatura, não', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor', 'Gigantosaurus', 'Indomitable Ancients'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'reach') && hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
    tg.attack([['Ripjaw Raptor', 1], ['Gigantosaurus', 1], ['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.state.zones.hand[0]).toHaveLength(2);
  });
});
