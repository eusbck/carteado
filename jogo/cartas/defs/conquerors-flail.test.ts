import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = "Conqueror's Flail";

describe(C, () => {
  it('conta as cores (no máximo cinco) das permanentes que você controla', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic', 'Wall of Omens', 'Dina, Essence Brewer'], []] });
    // verde (Mystic, Dina), branco (Wall), preto (Dina)
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([4, 4]);
  });
  it('anexado: oponentes não conjuram no seu turno; desanexado, podem', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], ['Island']], hand: [[], ['Opt']] });
    tg.pass();
    expect(tg.canCast('Opt')).toBe(false);
    const tg2 = setup({ battlefield: [[C, 'Elvish Mystic'], ['Island']], hand: [[], ['Opt']] });
    tg2.pass();
    expect(tg2.canCast('Opt')).toBe(true);
  });
});
