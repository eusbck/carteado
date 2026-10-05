import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Shielded by Faith', () => {
  it('dá indestrutível e pode passar para a criatura que entra (de qualquer jogador)', () => {
    const tg = setup({
      active: 1, battlefield: [['Wall of Omens', { name: 'Shielded by Faith', attachTo: 'Wall of Omens' }], ['Forest']], hand: [[], ['Elvish Mystic']],
      library: [['Island'], ['Island']],
    });
    const w = tg.bf('Wall of Omens');
    expect(hasKw(tg.g, w, 'indestructible')).toBe(true);
    tg.yes('Shielded by Faith');
    tg.cast('Elvish Mystic').resolve().resolveAll();
    const m = tg.bf('Elvish Mystic');
    expect(tg.state.objects[tg.bf('Shielded by Faith')].attachedTo).toBe(m);
    expect(hasKw(tg.g, m, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, w, 'indestructible')).toBe(false);
  });
});
