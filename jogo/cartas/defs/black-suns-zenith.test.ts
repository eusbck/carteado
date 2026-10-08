import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Black Sun's Zenith", () => {
  it('X marcadores -1/-1 em cada criatura e volta embaralhada ao grimório', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients', 'Elvish Mystic']], hand: [["Black Sun's Zenith"], []], library: [['Island'], []] });
    tg.number('valor de X', 2).cast("Black Sun's Zenith").resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library').sort()).toEqual(["Black Sun's Zenith", 'Island']);
  });
});
