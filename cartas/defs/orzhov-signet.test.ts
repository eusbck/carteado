import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Orzhov Signet', () => {
  it('{1}, {T}: adiciona {W}{B}', () => {
    const tg = setup({ battlefield: [['Orzhov Signet', 'Mountain'], []], hand: [['Killian, Ink Duelist'], []] });
    expect(tg.canCast('Killian, Ink Duelist')).toBe(true);
    tg.cast('Killian, Ink Duelist').resolve();
    expect(tg.find('Killian, Ink Duelist')).not.toBeNull();
  });
  it('não paga o próprio {1}', () => {
    const tg = setup({ battlefield: [['Orzhov Signet'], []], hand: [['Killian, Ink Duelist'], []] });
    expect(tg.canCast('Killian, Ink Duelist')).toBe(false);
  });
});
