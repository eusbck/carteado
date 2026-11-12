import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fauna Shaman', () => {
  it('descarta uma carta de criatura e busca outra carta de criatura', () => {
    const tg = setup({
      battlefield: [['Fauna Shaman', 'Forest'], []],
      hand: [['Sol Ring', 'Llanowar Elves'], []],
      library: [['Island', 'Elvish Mystic', 'Island'], []],
    });
    tg.choose('procure uma carta de criatura', ['Elvish Mystic']).activate('Fauna Shaman').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Llanowar Elves']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Sol Ring']);
  });
  it('sem carta de criatura na mão, não dá para ativar', () => {
    const tg = setup({ battlefield: [['Fauna Shaman', 'Forest'], []], hand: [['Sol Ring'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(tg.bf('Fauna Shaman'))))).toBe(false);
  });
});
