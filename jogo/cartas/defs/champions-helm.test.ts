import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = "Champion's Helm";

describe(C, () => {
  it('+2/+2; sem resistência a magia numa criatura que não é lendária', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.pt(elfo)).toEqual([3, 3]);
    expect(hasKw(tg.g, elfo, 'hexproof')).toBe(false);
  });
  it('criatura lendária equipada tem resistência a magia', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Dina, Essence Brewer' }, 'Dina, Essence Brewer'], []] });
    const dina = tg.bf('Dina, Essence Brewer');
    expect(tg.state.objects[tg.bf(C)].attachedTo).toBe(dina);
    expect(hasKw(tg.g, dina, 'hexproof')).toBe(true);
  });
});
