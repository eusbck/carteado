import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const mana = ['Plains', 'Plains', 'Plains', 'Plains', 'Island'];

describe('Time Wipe', () => {
  it('devolve uma criatura sua para a mão e destrói todas as outras', () => {
    const tg = setup({ battlefield: [[...mana, 'Wall of Omens', 'Indomitable Ancients'], ['Prognostic Sphinx']], hand: [['Time Wipe'], []] });
    tg.choose('devolver à mão', ['Wall of Omens']);
    tg.cast('Time Wipe').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Prognostic Sphinx')).toBeNull();
  });

  it('sem criaturas suas, só destrói todas as criaturas', () => {
    const tg = setup({ battlefield: [mana, ['Wall of Omens']], hand: [['Time Wipe'], []] });
    tg.cast('Time Wipe').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
  });
});
