import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Telling Time', () => {
  it('das três do topo, uma vai para a mão, uma fica no topo e uma vai para o fundo', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Telling Time'], []], library: [['Forest', 'Swamp', 'Plains', 'Mountain'], []] });
    tg.choose('vai para a sua mão', ['Swamp']).choose('fica no topo', ['Plains']);
    tg.cast('Telling Time').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Mountain', 'Forest']);
  });

  it('com duas cartas no grimório, uma vai para a mão e a outra fica no topo', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Telling Time'], []], library: [['Forest', 'Swamp'], []] });
    tg.choose('vai para a sua mão', ['Forest']);
    tg.cast('Telling Time').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });
});
