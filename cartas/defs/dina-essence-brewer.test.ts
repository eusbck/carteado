import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dina, Essence Brewer', () => {
  it('X é a força da criatura no campo; sacrificar compra uma vez por turno', () => {
    const tg = setup({ battlefield: [['Dina, Essence Brewer', { name: 'Indomitable Ancients', counters: { '+1/+1': 1 } }, 'Elvish Mystic', 'Plains', 'Plains'], []], library: [['Island', 'Island'], []] });
    tg.choose('Sacrifique', ['Indomitable Ancients']).choose('criatura alvo que você controla', ['Elvish Mystic']);
    tg.activate('Dina, Essence Brewer').resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([4, 4]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
