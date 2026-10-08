import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { removeFromCombat } from '../../motor/actions.ts';

describe('Mangara, the Diplomat', () => {
  it('compra uma só, com três atacando', () => {
    const tg = setup({ active: 1, battlefield: [['Mangara, the Diplomat'], ['Gau, Feral Youth', 'Glissa Sunslayer', 'Elvish Mystic']], library: [['Island', 'Island'], ['Island']] });
    tg.choose('escolha 1 modo', ['Você compra uma carta e perde 1 de vida']);
    tg.attack([['Gau, Feral Youth', 0], ['Glissa Sunslayer', 0], ['Elvish Mystic', 0]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('atacante removido do combate deixa de contar', () => {
    const tg = setup({ active: 1, battlefield: [['Mangara, the Diplomat'], ['Gau, Feral Youth', 'Elvish Mystic']], library: [['Island', 'Island'], ['Island']] });
    tg.attack([['Gau, Feral Youth', 0], ['Elvish Mystic', 0]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    removeFromCombat(tg.g, tg.bf('Elvish Mystic'));
    tg.refresh().resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('compra quando um oponente conjura a segunda mágica no turno', () => {
    const tg = setup({ active: 1, battlefield: [['Mangara, the Diplomat'], ['Swamp', 'Swamp', 'Swamp', 'Swamp']], hand: [[], ["Night's Whisper", "Night's Whisper"]], library: [['Island', 'Island'], ['Plains', 'Plains', 'Plains', 'Plains']] });
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
