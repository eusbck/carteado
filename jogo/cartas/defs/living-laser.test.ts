import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/api.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Living Laser';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('ímpeto; ao atacar, cria uma cópia não lendária virada e atacando para cada carta descartada no turno, exiladas na etapa final', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Hex', 'Hex'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    runEffect(tg, discard(tg.g, 0, 2));
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const fichas = tg.all(N).filter((x) => tg.state.objects[x].isToken);
    expect(fichas).toHaveLength(2);
    expect(chars(tg.g, fichas[0]).supertypes).not.toContain('Legendary');
    expect(tg.state.objects[fichas[0]].tapped).toBe(true);
    tg.passTo('main2', 0);
    // 4 do original e 4 de cada ficha
    expect(tg.life(1)).toBe(28);
    tg.passTo('main1', 1);
    expect(tg.all(N)).toEqual([id]);
  });

  it('sem descartes no turno, não cria fichas', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all(N)).toHaveLength(1);
    expect(tg.life(1)).toBe(36);
  });
});
