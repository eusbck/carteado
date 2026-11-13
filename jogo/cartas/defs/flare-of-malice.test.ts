import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Flare of Malice';

describe(NOME, () => {
  it('cada oponente sacrifica a criatura ou planeswalker de maior valor de mana', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens'], ['Wall of Omens', 'Sol Ring']], hand: [[NOME], [], []] });
    tg.cast(NOME, 'hand').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.names(2, 'graveyard')).toEqual(['Wall of Omens']);
  });

  it('pode ser conjurada sacrificando uma criatura preta que não é ficha', () => {
    const tg = setup({ battlefield: [['Accursed Marauder'], ['Indomitable Ancients']], hand: [[NOME], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.endsWith(':flare'));
    expect(acao).toBeDefined();
    tg.choose('Sacrifique', ['Accursed Marauder']);
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    tg.resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Accursed Marauder', NOME]);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
});
