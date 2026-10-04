import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ruinous Ultimatum', () => {
  it('destrói os permanentes não terrenos dos oponentes, e só deles', () => {
    const tg = setup({
      players: 3,
      battlefield: [['Mountain', 'Mountain', 'Plains', 'Plains', 'Plains', 'Swamp', 'Swamp', 'Wall of Omens'], ['Sol Ring', 'Forest', 'Indomitable Ancients'], ['Elvish Mystic']],
      hand: [['Ruinous Ultimatum'], [], []],
    });
    tg.cast('Ruinous Ultimatum').resolve();
    expect(tg.names(1, 'battlefield')).toEqual(['Forest']);
    expect(tg.names(2, 'battlefield')).toEqual([]);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
