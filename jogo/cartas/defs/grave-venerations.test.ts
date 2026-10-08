import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Grave Venerations', () => {
  it('vira monarca; o monarca compra na própria etapa final e recupera uma criatura', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [['Grave Venerations'], []], graveyard: [['Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.cast('Grave Venerations').resolve().resolveAll();
    expect(tg.state.monarch).toBe(0);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    tg.choose('até uma carta de criatura', ['Wall of Omens']);
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Wall of Omens']);
  });
});
