import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Counterspell', () => {
  it('CR 701.6a: anula a mágica alvo, que vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']] });
    tg.cast("Night's Whisper").pass();
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(["Night's Whisper"]);
  });
  it('CR 115.5: não pode ter a si mesma como alvo; sem outra mágica, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Counterspell'], []] });
    expect(tg.canCast('Counterspell')).toBe(false);
  });
});
