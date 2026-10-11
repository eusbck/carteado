import { describe, expect, it } from 'vitest';
import { chars, hasKw, isCreature } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Imprisoned in the Moon';

describe(N, () => {
  it('a criatura encantada vira um terreno incolor que só tem "{T}: Adicione {C}"', () => {
    const tg = setup({ battlefield: [[], ['Zetalpa, Primal Dawn', { name: N, attachTo: 'Zetalpa, Primal Dawn' }]], active: 1 });
    const z = tg.bf('Zetalpa, Primal Dawn');
    const c = chars(tg.g, z);
    expect(c.types).toEqual(['Land']);
    expect(c.subtypes).toEqual([]);
    expect(c.supertypes).toContain('Legendary');
    expect(c.colors).toEqual([]);
    expect(isCreature(tg.g, z)).toBe(false);
    expect(hasKw(tg.g, z, 'flying')).toBe(false);
    expect(c.abilities).toHaveLength(1);
    activateMana(tg, 'Zetalpa, Primal Dawn', 'C');
    expect(tg.state.players[1].manaPool.map((u) => u.type)).toEqual(['C']);
  });

  it('uma Plains encantada continua Plains, mas só gera {C}', () => {
    const tg = setup({ battlefield: [['Plains', { name: N, attachTo: 'Plains' }], []] });
    const p = tg.bf('Plains');
    expect(chars(tg.g, p).subtypes).toEqual(['Plains']);
    expect(chars(tg.g, p).supertypes).toContain('Basic');
    expect(() => activateMana(tg, 'Plains', 'W')).toThrow();
    activateMana(tg, 'Plains', 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });

  it('o planeswalker encantado deixa de ser planeswalker, não tem habilidades de lealdade e fica com os marcadores', () => {
    const Q = 'Quintorius, History Chaser';
    const tg = setup({ battlefield: [[{ name: Q, counters: { loyalty: 5 } }, { name: N, attachTo: Q }], []] });
    const q = tg.bf(Q);
    expect(chars(tg.g, q).types).toEqual(['Land']);
    expect(tg.state.objects[q].counters.loyalty).toBe(5);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    // sem lealdade para conferir, o terreno não morre por ação baseada em estado
    tg.pass();
    expect(tg.find(Q)).not.toBeNull();
  });

  it('pode encantar criatura, terreno ou planeswalker, mas não artefato', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Sol Ring', 'Indomitable Ancients'], []], hand: [[N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura, terreno ou planeswalker')) return null;
      const rotulos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      expect(rotulos).toContain('Indomitable Ancients');
      expect(rotulos).toContain('Island');
      expect(rotulos).not.toContain('Sol Ring');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(chars(tg.g, tg.bf('Indomitable Ancients')).types).toEqual(['Land']);
  });
});
