import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mole Module';

describe(N, () => {
  it('ameaçar, tripular 2; causando dano de combate a um jogador, tritura quatro e pode pôr uma permanente delas no campo', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []], library: [['Island', 'Silver Myr', 'Island', 'Island', 'Island'], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    tg.choose('Tripular:', ['Serra Angel']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mole Module')) return null;
      const myr = d.items.find((i) => i.label === 'Silver Myr') ?? d.items[0];
      return { kind: 'select', ids: [myr.id] };
    });
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 6);
    expect(tg.names(0, 'graveyard')).toHaveLength(3);
    expect(tg.names(0, 'library')).toHaveLength(1);
  });
});