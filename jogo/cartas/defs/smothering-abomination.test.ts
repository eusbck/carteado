import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Smothering Abomination', () => {
  it('é incolor', () => {
    const tg = setup({ battlefield: [['Smothering Abomination'], []], hand: [['Smothering Abomination'], []] });
    expect(chars(tg.g, tg.bf('Smothering Abomination')).colors).toEqual([]);
    expect(chars(tg.g, tg.find('Smothering Abomination', 'hand')!).colors).toEqual([]);
  });
  it('sacrificar a própria Abomination dispara a compra (CR 603.10a)', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Smothering Abomination'], []], library: [['Island', 'Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.find('Smothering Abomination')).toBeNull();
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('sempre que você sacrifica uma criatura, compra', () => {
    const tg = setup({ battlefield: [['Smothering Abomination', 'Viscera Seer', 'Elvish Mystic'], []], library: [['Island', 'Plains'], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']).activate('Viscera Seer');
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
  });
});
