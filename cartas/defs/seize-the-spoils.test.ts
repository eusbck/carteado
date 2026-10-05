import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Seize the Spoils', () => {
  it('descarta, compra duas e cria um Tesouro', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [['Seize the Spoils', 'Plains'], []], library: [['Island', 'Island'], []] });
    tg.cast('Seize the Spoils').resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', 'Seize the Spoils']);
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    expect(tg.all('Treasure').length).toBe(1);
  });
  it('sem carta para descartar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [['Seize the Spoils'], []] });
    expect(tg.canCast('Seize the Spoils')).toBe(false);
  });
});
