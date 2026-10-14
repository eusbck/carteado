import { describe, expect, it } from 'vitest';
import { hasKw, isAttacking } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Surrak, the Hunt Caller';

describe(N, () => {
  it('com força total 8 ou mais no início do combate, a criatura alvo ganha ímpeto e ataca; com menos, nada', () => {
    const tg = fixture({ battlefield: [[N, { name: 'Ripjaw Raptor', ready: false }], []] });
    tg.choose('criatura alvo que você controla', ['Ripjaw Raptor']).passTo('beginCombat');
    // 5 + 4 = 9: dispara no início do combate e resolve antes de declarar os atacantes
    expect(hasKw(tg.g, tg.bf('Ripjaw Raptor'), 'haste')).toBe(true);
    tg.attack([['Ripjaw Raptor', 1]]).passTo('declareBlockers');
    expect(isAttacking(tg.g, tg.bf('Ripjaw Raptor'))).toBe(true);

    const fraca = fixture({ battlefield: [[N, { name: 'Elvish Mystic', ready: false }], []] });
    fraca.passTo('beginCombat');
    fraca.resolveAll();
    expect(hasKw(fraca.g, fraca.bf('Elvish Mystic'), 'haste')).toBe(false);
  });
});
