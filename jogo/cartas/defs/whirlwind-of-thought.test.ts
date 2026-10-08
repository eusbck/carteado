import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Whirlwind of Thought', () => {
  it('mágica que não é de criatura compra uma carta; mágica de criatura não', () => {
    const tg = setup({ battlefield: [['Whirlwind of Thought', 'Forest', 'Forest'], []], hand: [['Sol Ring', 'Elvish Mystic'], []], library: [['Island', 'Swamp'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Island']);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('o gatilho resolve antes da mágica e mesmo que ela seja anulada', () => {
    const tg = setup({ battlefield: [['Whirlwind of Thought', 'Forest'], ['Island', 'Island']], hand: [['Sol Ring'], ['Counterspell']], library: [['Swamp'], []] });
    tg.cast('Sol Ring');
    // o gatilho está acima do Sol Ring
    expect(tg.state.zones.stack.length).toBe(2);
    tg.pass().choose('mágica alvo', ['Sol Ring']).cast('Counterspell').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});
