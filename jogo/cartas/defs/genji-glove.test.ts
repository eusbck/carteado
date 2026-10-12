import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Genji Glove';

describe(N, () => {
  it('a equipada tem golpe duplo; atacando no primeiro combate, desvira e há um combate adicional', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []] });
    const criatura = tg.bf('Indomitable Ancients');
    attach(tg.g, tg.bf(N), criatura);
    tg.refresh();
    expect(hasKw(tg.g, criatura, 'double strike')).toBe(true);
    const vida = tg.life(1);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers', 0);
    expect(tg.state.objects[criatura].tapped).toBe(false);
    tg.passTo('end', 0);
    expect(tg.state.turn.combatCount).toBe(2);
    expect(tg.life(1)).toBe(vida - 4);
  });
});