import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Demonic Embrace', () => {
  it('do cemitério, pagando 3 de vida e descartando: +3/+1, voar e Demon', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], graveyard: [['Demonic Embrace'], []], hand: [['Island'], []] });
    tg.choose('criatura', ['Wall of Omens']).cast('Demonic Embrace', 'cemiterio');
    expect(tg.life(0)).toBe(37);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    tg.resolve();
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([3, 5]);
    expect(hasKw(tg.g, w, 'flying')).toBe(true);
    expect(chars(tg.g, w).subtypes).toContain('Demon');
  });
  it('do cemitério continua sendo no tempo de feitiço', () => {
    const tg = setup({ active: 1, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], graveyard: [['Demonic Embrace'], []], hand: [['Island'], []] });
    tg.pass();
    expect(tg.pending!.player).toBe(0);
    expect(tg.canCast('Demonic Embrace')).toBe(false);
  });
});
