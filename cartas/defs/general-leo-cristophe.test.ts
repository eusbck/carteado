import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('General Leo Cristophe', () => {
  it('devolve a criatura e recebe um marcador por criatura que você controla', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Elvish Mystic'], []], hand: [['General Leo Cristophe'], []], graveyard: [['Wall of Omens'], []], library: [['Island', 'Island'], []] });
    tg.choose('até uma carta de criatura', ['Wall of Omens']);
    tg.cast('General Leo Cristophe').resolve().resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.pt(tg.bf('General Leo Cristophe'))).toEqual([5, 5]);
  });
});
