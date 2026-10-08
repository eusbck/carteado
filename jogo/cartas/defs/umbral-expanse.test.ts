import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup, entraVirado } from '../../testes/padroes.ts';

const NOME = "Umbral Expanse";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","W"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 702.29: ciclagem descarta e compra', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
