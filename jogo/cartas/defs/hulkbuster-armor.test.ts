import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hulkbuster Armor';

describe(N, () => {
  it('equipar Hero {3}: a criatura equipada tem força e resistência base 9/9 e voar', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', { name: 'Patriot, Shield Wielder', counters: { '+1/+1': 1 } }, 'Silver Myr'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Hero alvo que você controla')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Patriot, Shield Wielder']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Equipar Hero').resolveAll();
    const p = tg.bf('Patriot, Shield Wielder');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(p);
    // base 9/9 mais o marcador
    expect(tg.pt(p)).toEqual([10, 10]);
    expect(hasKw(tg.g, p, 'flying')).toBe(true);
  });
});