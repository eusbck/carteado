import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackingTarget } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kaalia of the Vast';

describe(N, () => {
  it('atacando um oponente, põe um Angel, Demon ou Dragon da mão no campo, virado e atacando esse oponente', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], hand: [['Serra Angel', 'Indomitable Ancients'], [], []] });
    const k = tg.bf(N);
    expect(tg.pt(k)).toEqual([2, 2]);
    expect(hasKw(tg.g, k, 'flying')).toBe(true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Kaalia')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Serra Angel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([[N, 2]]).passTo('declareBlockers');
    const anjo = tg.bf('Serra Angel');
    expect(tg.state.objects[anjo].tapped).toBe(true);
    expect(attackingTarget(tg.g, anjo)).toEqual({ kind: 'player', id: 2 });
    tg.passTo('main2', 0);
    expect(tg.life(2)).toBe(34);
    expect(tg.life(1)).toBe(40);
  });

  it('atacando um planeswalker, o gatilho não dispara', () => {
    const tg = setup({ battlefield: [[N], [{ name: 'Space Beleren', counters: { loyalty: 3 } }]], hand: [['Serra Angel'], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Kaalia')) throw new Error('não devia perguntar'); return null; });
    tg.attack([[N, { kind: 'obj', id: tg.bf('Space Beleren') }]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Serra Angel']);
  });
});