import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Avoid Fate', () => {
  it('anula a instantânea que tem como alvo uma criatura sua; não serve contra uma que mira a do oponente', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Forest', 'Llanowar Elves'], ['Plains', 'Elvish Mystic']],
      hand: [['Avoid Fate'], ['Swords to Plowshares']],
    });
    tg.choose('criatura alvo', ['Llanowar Elves']).cast('Swords to Plowshares');
    tg.pass();
    tg.cast('Avoid Fate');
    tg.resolveAll();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Swords to Plowshares']);
  });
  it('não pode mirar a instantânea que mira a criatura do oponente', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Forest', 'Llanowar Elves'], ['Plains', 'Elvish Mystic']],
      hand: [['Avoid Fate'], ['Swords to Plowshares']],
    });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Swords to Plowshares');
    tg.pass();
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
  });
});
