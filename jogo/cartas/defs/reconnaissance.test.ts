import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reconnaissance';
const lib = Array(8).fill('Plains');

describe(N, () => {
  it('{0}: remove do combate a sua criatura atacante alvo e a desvira; ela não causa dano', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr'], []], library: [lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    tg.attack([['Elvish Mystic', 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[elfo].tapped).toBe(true);
    tg.choose('criatura atacante alvo', ['Elvish Mystic']);
    tg.activate(N, '{0}').resolveAll();
    expect(tg.state.objects[elfo].tapped).toBe(false);
    expect(tg.state.combat?.attackers.some((a) => a.id === elfo && !a.removed)).toBe(false);
    tg.passTo('main2', 0);
    // só o Silver Myr causou dano
    expect(tg.life(1)).toBe(39);
  });

  it('fora do combate, não há alvo', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    expect(() => tg.activate(N, '{0}')).toThrow();
  });
});
