import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Barren Moor';

describe(NOME, () => {
  it('CR 605: produz {B}', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 702.29a: ciclagem {B} descarta e compra, usando a pilha como habilidade', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem');
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });
});
