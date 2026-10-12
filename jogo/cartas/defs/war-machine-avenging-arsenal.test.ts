import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'War Machine, Avenging Arsenal';

describe(N, () => {
  it('voar; atacando, as suas atacantes modificadas (marcador ou equipamento) ganham golpe duplo até o fim do turno', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }, 'Indomitable Ancients', 'Silver Myr', "Hero's Blade"], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    attach(tg.g, tg.bf("Hero's Blade"), tg.bf('Indomitable Ancients'));
    tg.refresh();
    const vida = tg.life(1);
    tg.attack([[N, 1], ['Indomitable Ancients', 1], ['Silver Myr', 1]]).passTo('declareBlockers', 0);
    expect(hasKw(tg.g, tg.bf(N), 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'double strike')).toBe(false);
    tg.passTo('main2', 0);
    // War Machine 4 e Ancients 5, duas vezes cada; o Silver Myr causa 1 uma vez só
    expect(tg.life(1)).toBe(vida - 19);
  });
});