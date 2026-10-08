import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const PLAINS = (n: number) => Array(n).fill('Plains');

describe('Sunfall', () => {
  it('exila todas as criaturas (de todos, fichas inclusive) e incuba X = quantas foram exiladas', () => {
    const tg = setup({
      battlefield: [[...PLAINS(5), 'Wall of Omens', { name: 'Soldier', token: true }, 'Sol Ring'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']],
      hand: [['Sunfall'], []],
    });
    tg.cast('Sunfall').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Soldier')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.names(0, 'exile')).toContain('Wall of Omens');
    expect(tg.names(1, 'exile').sort()).toEqual(['Indomitable Ancients', 'Zetalpa, Primal Dawn']);
    // o que não é criatura fica
    expect(tg.find('Sol Ring')).not.toBeNull();
    // CR 701.53a: Incubator de Ana com 4 marcadores +1/+1 (a ficha Soldier também foi exilada)
    const inc = tg.bf('Incubator', 0);
    expect(tg.state.objects[inc].counters['+1/+1']).toBe(4);
    const c = chars(tg.g, inc);
    expect([c.types, c.subtypes, c.colors]).toEqual([['Artifact'], ['Incubator'], []]);
    expect(tg.state.objects[inc].isToken).toBe(true);
  });

  it('a ficha transforma por {2} numa criatura artefato Phyrexian incolor X/X (o mesmo objeto, com os marcadores)', () => {
    const tg = setup({ battlefield: [[...PLAINS(7), 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Sunfall'], []] });
    tg.cast('Sunfall').resolve();
    const inc = tg.bf('Incubator', 0);
    tg.activate('Incubator', '{2}').resolve();
    // CR 712.18: não vira um objeto novo
    expect(tg.state.objects[inc].face).toBe(1);
    const c = chars(tg.g, inc);
    expect(c.name).toBe('Phyrexian Token');
    expect([c.types, c.subtypes, c.colors]).toEqual([['Artifact', 'Creature'], ['Phyrexian'], []]);
    expect(tg.pt(inc)).toEqual([2, 2]);
  });

  it('sem criaturas, incuba 0: a ficha entra sem marcadores e, transformada, morre como 0/0', () => {
    const tg = setup({ battlefield: [[...PLAINS(7)], []], hand: [['Sunfall'], []] });
    tg.cast('Sunfall').resolve();
    const inc = tg.bf('Incubator', 0);
    expect(tg.state.objects[inc].counters['+1/+1'] ?? 0).toBe(0);
    // a ficha não é criatura: sobrevive como artefato (as ações de estado já foram verificadas)
    expect(tg.find('Incubator')).not.toBeNull();
    tg.activate('Incubator', '{2}').resolve();
    // CR 704.5f: criatura com resistência 0 vai para o cemitério (e a ficha deixa de existir, 704.5d)
    expect(tg.find('Incubator')).toBeNull();
    expect(tg.find('Phyrexian Token')).toBeNull();
  });
});
