import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Tranquil Thicket';

describe(NOME, () => {
  it('CR 605: produz {G}', () => expect(alternativasDeMana(NOME)).toEqual(['G']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 702.29a: ciclagem {G} descarta e compra, usando a pilha como habilidade', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem');
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
