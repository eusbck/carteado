import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wingmantle Chaplain', () => {
  it('conta na resolução, inclusive ela mesma', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', 'Elvish Mystic'], []], hand: [['Wingmantle Chaplain'], []] });
    tg.cast('Wingmantle Chaplain').resolve().resolve();
    expect(tg.all('Bird').length).toBe(2);
  });
  it('outra criatura com defensor sua entra: um Bird', () => {
    const tg = setup({ battlefield: [['Wingmantle Chaplain', 'Plains', 'Plains', 'Island'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolve();
    tg.resolveAll();
    expect(tg.all('Bird').length).toBe(1);
  });
});
