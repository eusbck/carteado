import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as artefatos } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bloodlord of Vaasgoth';

describe(N, () => {
  it('sede de sangue 3: entra com três marcadores se um oponente tomou dano no turno; a mágica de Vampire que você conjura também ganha', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Swamp'), 'Elvish Mystic'], []], hand: [[N, 'Vampire Nighthawk'], []] });
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.cast('Vampire Nighthawk').resolveAll();
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([5, 6]);
  });

  it('sem dano a um oponente no turno, entra sem marcadores', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });

  it('Vampire posto no campo sem ser conjurado não ganha sede de sangue', () => {
    const tg = artefatos({ battlefield: [[N, 'Elvish Mystic'], []] });
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    const id = enterCard(tg, 'Vampire Nighthawk', 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([2, 3]);
  });
});
