import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = 'Fiendish Duo';

describe(NOME, () => {
  it('CR 614.1a: o dano a um oponente é dobrado, de qualquer fonte; o dano a você não', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens'], ['Indomitable Ancients']] });
    dealDamage(tg.g, [{ source: tg.bf('Wall of Omens'), target: { kind: 'player', id: 1 }, amount: 3, combat: false }]);
    expect(tg.life(1)).toBe(34);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
  });
  it('tem primeiro golpe; em combate, o dano ao oponente é dobrado', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.attack([[NOME, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(30);
  });
});
