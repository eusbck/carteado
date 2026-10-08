import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { discard } from '../../motor/api.ts';

describe("Banon, the Returners' Leader", () => {
  it('conjura do cemitério uma criatura descartada neste turno, uma vez por turno', () => {
    const tg = setup({ battlefield: [["Banon, the Returners' Leader", 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Elvish Mystic'], []], graveyard: [['Wall of Omens'], []] });
    tg.run(discard(tg.g, 0, 2));
    tg.refresh();
    expect(tg.canCast('Wall of Omens')).toBe(false); // já estava no cemitério
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    tg.cast('Elvish Mystic', '*').resolve();
    expect(tg.canCast('Elvish Mystic')).toBe(false); // uma vez por turno
  });
  it('ao atacar, paga {1} e descarta para comprar', () => {
    const tg = setup({ battlefield: [[{ name: "Banon, the Returners' Leader", ready: true }, 'Plains'], []], hand: [['Island'], []], library: [['Plains'], ['Island']] });
    tg.yes('Banon');
    tg.attack([["Banon, the Returners' Leader", 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
});
