import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe("Sentinel's Eyes", () => {
  it('foge do cemitério exilando duas outras cartas; depois de fugir, volta ao cemitério ao morrer a criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Wall of Omens'], []], graveyard: [["Sentinel's Eyes", 'Island', 'Swamp'], []], library: [['Island'], []] });
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast("Sentinel's Eyes", 'escape').resolve();
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([1, 5]);
    expect(hasKw(tg.g, w, 'vigilance')).toBe(true);
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', 'Swamp']);
    tg.run(destroy(tg.g, [w]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(["Sentinel's Eyes", 'Wall of Omens']);
  });
});
