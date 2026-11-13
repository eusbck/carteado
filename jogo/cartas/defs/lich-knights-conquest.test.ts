import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Lich-Knights' Conquest";

describe(NOME, () => {
  it('sacrifica artefatos e fichas e devolve a mesma quantidade de criaturas do cemitério', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Sol Ring', { name: 'Thrull', token: true }], []],
      hand: [[NOME], []], graveyard: [['Indomitable Ancients', 'Wall of Omens', 'Accursed Marauder'], []], library: [['Island'], []],
    });
    tg.choose('sacrifique quantos', ['Sol Ring', 'Thrull']).choose('devolva 2', ['Indomitable Ancients', 'Wall of Omens']);
    tg.cast(NOME).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Accursed Marauder')).toBeNull();
  });

  it('sem sacrificar nada, nada volta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Sol Ring'], []], hand: [[NOME], []], graveyard: [['Indomitable Ancients'], []] });
    tg.choose('sacrifique quantos', []);
    tg.cast(NOME).resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('a criatura artefato sacrificada pode ser uma das que voltam', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Burnished Hart'], []], hand: [[NOME], []] });
    tg.choose('sacrifique quantos', ['Burnished Hart']);
    tg.cast(NOME).resolve();
    expect(tg.find('Burnished Hart')).not.toBeNull();
  });
});
