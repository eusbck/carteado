import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Amphibian Downpour';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('uma criatura artefato lendária vira Frog azul 1/1, continua lendária e deixa de ser artefato', () => {
    const tg = setup({ battlefield: [ilhas, ['Anrakyr the Traveller']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const c = chars(tg.g, tg.bf('Anrakyr the Traveller'));
    expect(c.types).toEqual(['Creature']);
    expect(c.subtypes).toEqual(['Frog']);
    expect(c.supertypes).toContain('Legendary');
    expect(c.colors).toEqual(['U']);
    expect([c.power, c.toughness]).toEqual([1, 1]);
    expect(c.abilities).toEqual([]);
  });
  it('marcadores +1/+1 continuam somando à base 1/1', () => {
    const tg = setup({ battlefield: [ilhas, [{ name: 'Spellseeker', counters: { '+1/+1': 2 } }]], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Spellseeker'))).toEqual([3, 3]);
  });
  it('conta as mágicas conjuradas antes no turno; as cópias viram fichas presas a outras criaturas', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Island'], ['Spellseeker', 'Elvish Mystic']], hand: [['Opt', N], []], library: [['Forest', 'Forest'], []] });
    tg.cast('Opt').resolve();
    tg.choose('criatura alvo', ['Spellseeker']).yes('Escolher novos alvos', true).choose('cópia de Amphibian Downpour', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    expect(chars(tg.g, tg.bf('Spellseeker')).subtypes).toEqual(['Frog']);
    expect(chars(tg.g, tg.bf('Elvish Mystic')).subtypes).toEqual(['Frog']);
    const auras = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N);
    expect(auras).toHaveLength(2);
    expect(auras.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });
});
