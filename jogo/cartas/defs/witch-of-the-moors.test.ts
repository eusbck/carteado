import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Witch of the Moors', () => {
  it('cada oponente sacrifica uma criatura e uma criatura volta para a mão', () => {
    const tg = setup({ players: 3, step: 'main2', battlefield: [['Witch of the Moors'], ['Elvish Mystic'], ['Wall of Omens']], graveyard: [['Gau, Feral Youth'], [], []], library: [['Island'], ['Island'], ['Island']] });
    gainLife(tg.g, 0, 1, null);
    tg.refresh().choose('até uma carta de criatura', ['Gau, Feral Youth']);
    tg.passTo('end').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Gau, Feral Youth']);
  });
  it('sem vida ganha, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [['Witch of the Moors'], ['Elvish Mystic']], library: [['Island'], ['Island']] });
    tg.passTo('end');
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
