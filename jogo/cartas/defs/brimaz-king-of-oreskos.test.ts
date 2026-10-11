import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Brimaz, King of Oreskos';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('vigilância; ao atacar, cria um Cat Soldier 1/1 com vigilância que está atacando', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const ficha = tg.bf('Cat Soldier');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(hasKw(tg.g, ficha, 'vigilance')).toBe(true);
    expect(tg.state.combat?.attackers.some((a) => a.id === ficha)).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });

  it('ao bloquear, cria um Cat Soldier que está bloqueando a mesma criatura', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Keeper of Fables']], library: [lib, lib] });
    tg.attack([['Keeper of Fables', 0]]);
    tg.block([[N, 'Keeper of Fables']]);
    tg.passTo('declareBlockers', 1);
    tg.resolveAll();
    const ficha = tg.bf('Cat Soldier');
    const atacante = tg.bf('Keeper of Fables');
    expect(tg.state.combat?.blockers.find((b) => b.id === ficha)?.blocking).toEqual([atacante]);
    tg.passTo('main2', 1);
    // bloqueado: você não toma dano; o Keeper 4/5 toma 3 de Brimaz e 1 da ficha
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[atacante].damage).toBe(4);
  });
});
