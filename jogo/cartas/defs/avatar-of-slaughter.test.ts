import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { validateAttack } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Avatar of Slaughter';

describe(N, () => {
  it('todas as criaturas, de todos os jogadores, têm golpe duplo e atacam se puderem', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], ['Silver Myr']] });
    expect(tg.pt(tg.bf(N))).toEqual([8, 8]);
    for (const nome of [N, 'Indomitable Ancients', 'Silver Myr']) expect(hasKw(tg.g, tg.bf(nome), 'double strike')).toBe(true);
    // não atacar com tudo é recusado
    expect(validateAttack(tg.g, 0, [])).not.toBeNull();
    expect(validateAttack(tg.g, 0, [[tg.bf(N), { kind: 'player', id: 1 }], [tg.bf('Indomitable Ancients'), { kind: 'player', id: 1 }]])).toBeNull();
    // golpe duplo: Indomitable Ancients (2) causa 4
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(40 - 16 - 4);
  });
});