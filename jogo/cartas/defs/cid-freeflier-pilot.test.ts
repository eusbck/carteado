import { describe, expect, it } from 'vitest';
import { hasKw, manaValue } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cid, Freeflier Pilot';

describe(N, () => {
  it('um Equipment de {2} custa {1}, um Vehicle de {2} custa {1} e um Equipment de {1} custa {0}', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Swiftfoot Boots', "Smuggler's Copter", 'Shadowspear'], []] });
    tg.cast('Swiftfoot Boots').resolveAll();
    expect(tg.find('Swiftfoot Boots')).not.toBeNull();
    tg.cast("Smuggler's Copter").resolveAll();
    expect(tg.find("Smuggler's Copter")).not.toBeNull();
    // sem terrenos desvirados, o Shadowspear sai de graça
    tg.cast('Shadowspear').resolveAll();
    expect(tg.find('Shadowspear')).not.toBeNull();
  });

  it('sem Cid, o Equipment de {2} não sai com uma mana', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [['Swiftfoot Boots'], []] });
    expect(tg.canCast('Swiftfoot Boots')).toBe(false);
  });

  it('o valor de mana não muda com a redução', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Swiftfoot Boots'], []] });
    tg.cast('Swiftfoot Boots');
    const sp = tg.state.zones.stack[tg.state.zones.stack.length - 1];
    expect(manaValue(tg.g, sp)).toBe(2);
  });

  it('Jump: tem voar só durante o seu turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    const cid = tg.bf(N);
    expect(hasKw(tg.g, cid, 'flying')).toBe(true);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, cid, 'flying')).toBe(false);
  });

  it('{2}, {T}: devolve uma carta de Equipment ou Vehicle do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], graveyard: [['Swiftfoot Boots', 'Llanowar Elves'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Equipment ou Vehicle')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Swiftfoot Boots']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Devolva').resolveAll();
    expect(tg.names(0, 'hand')).toContain('Swiftfoot Boots');
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
