import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Thrill of Possibility', () => {
  it('descarta e compra duas', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Thrill of Possibility', 'Plains'], []], library: [['Island', 'Island'], []] });
    tg.cast('Thrill of Possibility').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', 'Thrill of Possibility']);
  });
  it('sem carta para descartar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Thrill of Possibility'], []] });
    expect(tg.canCast('Thrill of Possibility')).toBe(false);
  });
});
