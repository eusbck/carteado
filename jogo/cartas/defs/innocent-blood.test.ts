import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Innocent Blood', () => {
  it('cada jogador sacrifica uma criatura; quem não tem criatura não é afetado', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Wall of Omens'], ['Indomitable Ancients'], ['Island']], hand: [['Innocent Blood'], [], []] });
    tg.cast('Innocent Blood').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens', 'Innocent Blood']);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Island')).not.toBeNull();
  });
});
