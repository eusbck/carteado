import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rootha, Mastering the Moment', () => {
  it('cria um Elemental X/X com o maior valor de mana do turno', () => {
    const tg = setup({ battlefield: [['Rootha, Mastering the Moment', 'Swamp', 'Swamp', 'Mountain'], ['Elvish Mystic']], hand: [["Night's Whisper", 'Abrade'], []], library: [['Island', 'Island'], ['Island']] });
    tg.cast("Night's Whisper").resolve();
    tg.passTo('beginCombat').resolve();
    expect(tg.pt(tg.bf('Elemental'))).toEqual([2, 2]);
  });
  it('sem mágica no turno, não dispara', () => {
    const tg = setup({ battlefield: [['Rootha, Mastering the Moment'], []], library: [['Island'], ['Island']] });
    tg.passTo('declareAttackers');
    expect(tg.find('Elemental')).toBeNull();
  });
});
