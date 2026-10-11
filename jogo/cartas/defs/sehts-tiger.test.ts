import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Seht's Tiger";
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('lampejo; você ganha proteção contra a cor escolhida até o fim do turno: o dano de fontes dessa cor é prevenido', () => {
    const tg = setup({ battlefield: [[], ['Elvish Mystic', 'Silver Myr']], library: [lib, lib] });
    tg.choose("Seht's Tiger", ['G']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    // fonte verde: prevenido; fonte incolor: passa
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(40);
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
    // no turno seguinte, acabou
    tg.passTo('main1', 1);
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(34);
  });
});
