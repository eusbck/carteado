import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Szarekh, the Silent King';

describe(N, () => {
  it('voar; atacando, tritura três cartas e pode pôr na mão uma criatura artefato ou Veículo entre elas', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Elvish Mystic', 'Silver Myr', 'Sol Ring', 'Island'], ['Island']] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Szarekh')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Sol Ring']);
  });
});