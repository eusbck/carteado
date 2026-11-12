import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Embermaw Hellion';

describe(N, () => {
  it('a fonte vermelha causa o dano mais 1; a Hellion não causa dano', () => {
    const tg = setup({ battlefield: [[N, 'Tunneling Geopede', 'Indomitable Ancients'], []] });
    const geo = tg.bf('Tunneling Geopede');
    dealDamage(tg.g, [{ source: geo, target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    expect(tg.life(1)).toBe(38);
    // fonte que não é vermelha: sem bônus; a própria Hellion: sem bônus
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    dealDamage(tg.g, [{ source: tg.bf(N), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    expect(tg.life(1)).toBe(36);
  });
  it('duas Hellions somam 2 às outras fontes e 1 uma à outra', () => {
    const tg = setup({ battlefield: [[N, N, 'Tunneling Geopede'], []] });
    const [h1] = tg.all(N);
    dealDamage(tg.g, [{ source: tg.bf('Tunneling Geopede'), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    expect(tg.life(1)).toBe(37);
    dealDamage(tg.g, [{ source: h1, target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    expect(tg.life(1)).toBe(35);
  });
});
