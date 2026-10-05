import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Ethereal Armor', () => {
  it('conta a própria e Auras suas anexadas a criaturas do oponente', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', { name: 'Ethereal Armor', attachTo: 'Elvish Mystic' }, 'Bastion of Remembrance', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], ['Wall of Omens']] });
    const m = tg.bf('Elvish Mystic');
    expect(tg.pt(m)).toEqual([4, 4]);
    expect(hasKw(tg.g, m, 'first strike')).toBe(true);
  });
});
