import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mana-Charged Dragon';

describe(N, () => {
  it('voar e atropelar; atacando, cada jogador, começando por você, pode pagar mana e ele recebe +X/+0', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain'], ['Island', 'Island']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    const quem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'number' && d.prompt.includes('Unir forças')) quem.push(d.player); return null; });
    tg.number('Unir forças', 2).number('Unir forças', 1);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(quem).toEqual([0, 1]);
    expect(tg.pt(id)).toEqual([8, 5]);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(32);
    tg.passTo('upkeep', 1);
    expect(tg.pt(id)).toEqual([5, 5]);
  });

  it('bloqueando também dispara; quem não paga não soma', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Mountain'], ['Indomitable Ancients']] });
    tg.number('Unir forças', 0);
    tg.attack([['Indomitable Ancients', 0]]).block([[N, 'Indomitable Ancients']]).passTo('main2', 1);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(tg.life(0)).toBe(40);
  });
});