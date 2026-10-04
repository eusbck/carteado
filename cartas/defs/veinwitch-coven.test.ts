import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Veinwitch Coven', () => {
  it('dispara uma vez por evento, qualquer que seja a quantidade; paga {B} uma vez por evento', () => {
    const tg = setup({ battlefield: [['Veinwitch Coven', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens', 'Elvish Mystic'], []] });
    expect(hasKw(tg.g, tg.bf('Veinwitch Coven'), 'menace')).toBe(true);
    gainLife(tg.g, 0, 3, null);
    tg.refresh();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.choose('carta de criatura alvo', ['Elvish Mystic']).yes('Pagar {B}', true);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
  it('sem pagar, não devolve', () => {
    const tg = setup({ battlefield: [['Veinwitch Coven', 'Swamp'], []], graveyard: [['Wall of Omens'], []] });
    gainLife(tg.g, 0, 1, null);
    tg.yes('Pagar {B}', false);
    tg.refresh().resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
