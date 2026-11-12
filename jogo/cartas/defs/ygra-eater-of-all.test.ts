import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ygra, Eater of All';

describe(N, () => {
  it('as outras criaturas são artefatos Food, mantêm os outros tipos e podem ser comidas por 3 de vida', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Forest'], ['Elvish Mystic']] });
    const elfo = tg.bf('Elvish Mystic');
    expect(chars(tg.g, elfo).types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(chars(tg.g, elfo).subtypes).toEqual(expect.arrayContaining(['Elf', 'Druid', 'Food']));
    expect(chars(tg.g, tg.bf(N)).subtypes).not.toContain('Food');
    expect(chars(tg.g, tg.bf('Sol Ring')).subtypes).not.toContain('Food');
    // o oponente come o próprio elfo
    const t = setup({ active: 1, battlefield: [[N], ['Elvish Mystic', 'Forest', 'Forest']] });
    t.activate('Elvish Mystic', 'vida').resolveAll();
    expect(t.life(1)).toBe(43);
    // a Food (o elfo) foi para o cemitério: dois marcadores na Ygra
    expect(t.state.objects[t.bf(N)].counters['+1/+1']).toBe(2);
  });

  it('uma criatura (que é Food) morrendo dá dois marcadores à Ygra', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], ['Elvish Mystic']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
  });

  it('CR 702.21a: resguardo — sacrificar uma Food; o oponente pode sacrificar uma criatura dele, que é Food', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Swamp', 'Swamp', 'Elvish Mystic']], hand: [[], ['Infernal Grasp']] });
    tg.yes('Resguardo', true).choose('criatura alvo', [N]).cast('Infernal Grasp').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find(N, 'graveyard')).not.toBeNull();
  });

  it('sem pagar o resguardo, a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Swamp', 'Swamp', 'Elvish Mystic']], hand: [[], ['Infernal Grasp']] });
    tg.yes('Resguardo', false).choose('criatura alvo', [N]).cast('Infernal Grasp').resolveAll();
    expect(tg.bf(N)).toBeTruthy();
    expect(tg.bf('Elvish Mystic')).toBeTruthy();
    expect(tg.names(1, 'graveyard')).toEqual(['Infernal Grasp']);
  });
});
