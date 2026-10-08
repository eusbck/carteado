import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const terrenos = ['Island', 'Island', 'Mountain', 'Mountain', 'Mountain'];

describe('Splatter Technique', () => {
  it('modo 1: compra quatro', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [['Splatter Technique'], []], library: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []] });
    tg.choose('modo', ['Compre quatro cartas']).cast('Splatter Technique').resolve();
    expect(tg.names(0, 'hand').length).toBe(4);
  });
  it('modo 2: 4 de dano a cada criatura e planeswalker', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Wall of Omens'], ['Indomitable Ancients', { name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]], hand: [['Splatter Technique'], []] });
    tg.choose('modo', ['Causa 4 de dano a cada criatura e planeswalker']).cast('Splatter Technique').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty).toBe(1);
  });
});
