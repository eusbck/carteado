import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Big Score', () => {
  it('descarta como custo; compra duas e cria dois Tesouros', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Big Score', 'Island'], []], library: [['Plains', 'Plains'], []] });
    tg.cast('Big Score');
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
    expect(tg.all('Treasure').length).toBe(2);
  });
  it('sem outra carta na mão, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Big Score'], []] });
    expect(tg.canCast('Big Score')).toBe(false);
  });
});
