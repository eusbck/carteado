import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Kor Spiritdancer', () => {
  it('dispara com Aura em outra criatura; +2/+2 por Aura anexada a ela', () => {
    const tg = setup({
      battlefield: [['Plains', 'Kor Spiritdancer', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Kor Spiritdancer' }], []], hand: [['Ethereal Armor'], []],
      library: [['Island', 'Island'], []],
    });
    expect(tg.pt(tg.bf('Kor Spiritdancer'))).toEqual([2, 4]);
    tg.choose('criatura', ['Wall of Omens']).yes('comprar uma carta');
    tg.cast('Ethereal Armor').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
