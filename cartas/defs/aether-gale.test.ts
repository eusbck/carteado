import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const seis = ['Sol Ring', 'Wall of Omens', 'Indomitable Ancients', 'Arcane Signet', 'Elvish Mystic', 'Millikin'];

describe('Aether Gale', () => {
  it('CR 115.3: precisa de seis alvos diferentes; os que continuam legais voltam para a mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Sol Ring', 'Sol Ring'], seis], hand: [['Aether Gale'], []] });
    tg.choose('seis permanentes', seis.map((n) => tg.bf(n, 1))).cast('Aether Gale').resolve();
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'hand').sort()).toEqual([...seis].sort());
  });
  it('com menos de seis permanentes não terrenos, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Sol Ring', 'Sol Ring'], seis.slice(0, 3)], hand: [['Aether Gale'], []] });
    expect(tg.canCast('Aether Gale')).toBe(false);
  });
});
