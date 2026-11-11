import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { untilEndOfTurn } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Colossus Hammer';
const terrenos = Array(8).fill('Plains');

describe(N, () => {
  it('equipar {8}: a criatura equipada recebe +10/+10; sem voar, continua sem voar', () => {
    const tg = setup({ battlefield: [[N, ...terrenos, 'Indomitable Ancients'], []] });
    tg.activate(N, 'Equipar').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(a);
    expect(tg.pt(a)).toEqual([12, 20]);
    expect(hasKw(tg.g, a, 'flying')).toBe(false);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(8);
  });

  it('a criatura equipada perde voar', () => {
    const tg = setup({ battlefield: [[N, ...terrenos, 'Serra Angel'], []] });
    tg.activate(N, 'Equipar').resolveAll();
    const anjo = tg.bf('Serra Angel');
    expect(tg.pt(anjo)).toEqual([14, 14]);
    expect(hasKw(tg.g, anjo, 'flying')).toBe(false);
    expect(hasKw(tg.g, anjo, 'vigilance')).toBe(true);
  });

  it('CR 613.7: voar ganho depois de equipar fica', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients'], []] });
    const a = tg.bf('Indomitable Ancients');
    untilEndOfTurn({ g: tg.g, you: 0, source: a }, [a], [{ k: 'addKeyword', kw: 'flying' }]);
    tg.refresh();
    expect(hasKw(tg.g, a, 'flying')).toBe(true);
  });

  it('CR 613.7a: o voar "enquanto" da própria criatura (Cid, durante o seu turno) é perdido', () => {
    const tg = setup({ battlefield: [[N, ...terrenos, 'Cid, Freeflier Pilot'], []] });
    const cid = tg.bf('Cid, Freeflier Pilot');
    expect(hasKw(tg.g, cid, 'flying')).toBe(true);
    tg.activate(N, 'Equipar').resolveAll();
    expect(hasKw(tg.g, cid, 'flying')).toBe(false);
    expect(tg.pt(cid)).toEqual([12, 12]);
  });
});
