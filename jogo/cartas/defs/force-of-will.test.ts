import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Force of Will';

describe(N, () => {
  it('pagando 1 de vida e exilando uma carta azul da mão, anula a mágica alvo sem gastar mana', () => {
    const tg = setup({ active: 1, battlefield: [[], Array(5).fill('Plains')], hand: [[N, 'Mana Drain', 'Elvish Mystic'], ['Serra Angel']] });
    const vida = tg.life(0);
    tg.cast('Serra Angel').pass();
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta azul')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Mana Drain']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Serra Angel') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N, 'forca').resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.life(0)).toBe(vida - 1);
    expect(tg.names(0, 'exile')).toEqual(['Mana Drain']);
  });
});