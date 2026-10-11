import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Raffine's Tower";

describe(NOME, () => {
  it('CR 305.6: mana dos três tipos básicos de terreno', () => {
    expect(alternativasDeMana(NOME)).toEqual(['B', 'U', 'W']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Plains', 'Island', 'Swamp']);
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual([]);
  });
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 702.29: ciclagem {3} descarta e compra', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Island'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
