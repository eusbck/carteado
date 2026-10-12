import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Captain America, Living Legend';

describe(N, () => {
  it('vigilância; a sua criatura virada pela primeira vez no seu turno é desvirada; na segunda vez, não', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
    const myr = tg.bf('Silver Myr');
    activateMana(tg, 'Silver Myr', 'U');
    tg.resolveAll();
    expect(tg.state.objects[myr].tapped).toBe(false);
    activateMana(tg, 'Silver Myr', 'U');
    tg.resolveAll();
    expect(tg.state.objects[myr].tapped).toBe(true);
  });
});