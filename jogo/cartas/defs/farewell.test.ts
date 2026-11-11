import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Farewell';
const W6 = Array(6).fill('Plains');

describe(C, () => {
  it('ruling 1: com mais de um modo, cada um acontece na ordem impressa', () => {
    const tg = setup({ battlefield: [[...W6, 'Basilisk Collar', 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[C], []], graveyard: [['Opt'], []] });
    tg.choose('modo', ['Exile todos os artefatos', 'Exile todas as criaturas', 'Exile todos os cemitérios']);
    tg.cast(C).resolve();
    expect(tg.find('Basilisk Collar')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual(expect.arrayContaining(['Basilisk Collar', 'Elvish Mystic', 'Opt']));
    // o próprio Farewell vai para o cemitério depois de resolver
    expect(tg.names(0, 'graveyard')).toEqual([C]);
  });
  it('só um modo: as criaturas ficam', () => {
    const tg = setup({ battlefield: [[...W6, 'Basilisk Collar', 'Elvish Mystic'], []], hand: [[C], []] });
    tg.choose('modo', ['Exile todos os artefatos']);
    tg.cast(C).resolve();
    expect(tg.find('Basilisk Collar')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
