import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Siegfried, Famed Swordsman', () => {
  it('conta as criaturas no cemitério depois de moer', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Siegfried, Famed Swordsman'], []], graveyard: [['Elvish Mystic'], []],
      library: [['Wall of Omens', 'Island', 'Gau, Feral Youth', 'Plains'], []],
    });
    tg.cast('Siegfried, Famed Swordsman').resolve().resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.pt(tg.bf('Siegfried, Famed Swordsman'))).toEqual([8, 8]);
  });
});
