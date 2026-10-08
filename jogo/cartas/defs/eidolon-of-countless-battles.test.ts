import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

const EIDOLON = 'Eidolon of Countless Battles';

describe(EIDOLON, () => {
  it('como criatura: +1/+1 por criatura e por Aura', () => {
    const tg = setup({ battlefield: [[EIDOLON, 'Wall of Omens', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(EIDOLON))).toEqual([3, 3]);
  });
  it('na pilha por bestow é Aura, não criatura; anexada conta só como Aura; solta, continua no campo como criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], []], hand: [[EIDOLON], []], library: [['Island'], []] });
    tg.choose('criatura', ['Wall of Omens']).cast(EIDOLON, 'bestow');
    const naPilha = tg.state.zones.stack[0];
    expect(chars(tg.g, naPilha).types).toEqual(['Enchantment']);
    tg.resolve();
    const e = tg.bf(EIDOLON);
    expect(chars(tg.g, e).types).toEqual(['Enchantment']);
    expect(chars(tg.g, e).subtypes).toContain('Aura');
    // 1 criatura (Wall) + 1 Aura (Eidolon): +2/+2
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    expect(tg.find(EIDOLON)).not.toBeNull();
    expect(chars(tg.g, tg.bf(EIDOLON)).types).toContain('Creature');
    expect(tg.pt(tg.bf(EIDOLON))).toEqual([1, 1]);
  });
});
