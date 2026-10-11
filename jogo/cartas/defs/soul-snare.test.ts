import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Soul Snare';

describe(N, () => {
  it('sacrificado, exila a criatura que está atacando você', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Plains'], ['Indomitable Ancients', 'Silver Myr']] });
    // fora do combate não há alvo
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers');
    while (tg.pending?.player !== 0) tg.pass();
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura alvo que está atacando')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Indomitable Ancients']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
  });
});