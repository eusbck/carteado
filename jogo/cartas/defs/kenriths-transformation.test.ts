import { describe, expect, it } from 'vitest';
import { chars, hasKw, untilEndOfTurn } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = "Kenrith's Transformation";

describe(N, () => {
  it('vira uma criatura Elk verde 3/3 sem habilidades, ainda lendária, e você compra uma carta', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], ['Zetalpa, Primal Dawn']], hand: [[N], []], library: [['Island'], []] });
    tg.choose('criatura', ['Zetalpa, Primal Dawn']).cast(N).resolve().resolve();
    const z = tg.bf('Zetalpa, Primal Dawn');
    const c = chars(tg.g, z);
    expect(c.types).toEqual(['Creature']);
    expect(c.subtypes).toEqual(['Elk']);
    expect(c.colors).toEqual(['G']);
    expect(c.supertypes).toContain('Legendary');
    expect(tg.pt(z)).toEqual([3, 3]);
    expect(hasKw(tg.g, z, 'flying')).toBe(false);
    expect(hasKw(tg.g, z, 'indestructible')).toBe(false);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('os marcadores continuam valendo', () => {
    const tg = setup({ battlefield: [[], [{ name: 'Zetalpa, Primal Dawn', counters: { '+1/+1': 1 } }, { name: N, attachTo: 'Zetalpa, Primal Dawn' }]] });
    expect(tg.pt(tg.bf('Zetalpa, Primal Dawn'))).toEqual([4, 4]);
  });

  it('a habilidade ganha depois continua valendo', () => {
    const tg = setup({ battlefield: [[], ['Zetalpa, Primal Dawn', { name: N, attachTo: 'Zetalpa, Primal Dawn' }]] });
    const z = tg.bf('Zetalpa, Primal Dawn');
    untilEndOfTurn({ g: tg.g, you: 1, source: tg.bf(N) }, [z], [{ k: 'addKeyword', kw: 'flying' }]);
    tg.refresh();
    expect(hasKw(tg.g, z, 'flying')).toBe(true);
    expect(hasKw(tg.g, z, 'double strike')).toBe(false);
  });

  it('num Veículo tripulado, continua criatura Elk depois do fim do turno', () => {
    const tg = fixture({ battlefield: [["Cultivator's Caravan", 'Indomitable Ancients', 'Indomitable Ancients', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate("Cultivator's Caravan", 'Tripular').resolveAll();
    tg.choose('criatura', ["Cultivator's Caravan"]).cast(N).resolveAll();
    tg.passTo('upkeep', 1);
    const v = tg.bf("Cultivator's Caravan");
    expect(chars(tg.g, v).types).toEqual(['Creature']);
    expect(chars(tg.g, v).subtypes).toEqual(['Elk']);
    expect(tg.pt(v)).toEqual([3, 3]);
  });
});
