import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Expressive Iteration', () => {
  it('o terreno exilado pode ser jogado neste turno (se ainda houver jogada de terreno)', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain'], []], hand: [['Expressive Iteration'], []], library: [['Wall of Omens', 'Plains', 'Forest', 'Swamp'], []] });
    tg.choose('vai para a mão', ['Wall of Omens']).choose('vai para o fundo', ['Plains']);
    tg.cast('Expressive Iteration').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'exile')).toEqual(['Forest']);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Plains']);
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
  });
  it('com duas cartas, uma para a mão e uma para o fundo', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain'], []], hand: [['Expressive Iteration'], []], library: [['Wall of Omens', 'Plains'], []] });
    tg.choose('vai para a mão', ['Wall of Omens']).choose('vai para o fundo', ['Plains']);
    tg.cast('Expressive Iteration').resolve();
    expect(tg.names(0, 'exile')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
