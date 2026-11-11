import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Borg Scout Sphere';

describe(C, () => {
  it('estação: vira outra criatura e recebe cargas iguais à força; com 6+ é criatura e dá voar', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 3 } }, { name: 'Ornithopter', counters: { '+1/+1': 3 } }], []] });
    expect(isCreature(tg.g, tg.bf(C))).toBe(false);
    tg.choose('outra criatura', ['Ornithopter']).activate(C, 'Estação').resolve();
    expect(tg.state.objects[tg.bf(C)].counters.charge).toBe(6);
    expect(isCreature(tg.g, tg.bf(C))).toBe(true);
    expect(hasKw(tg.g, tg.bf('Ornithopter'), 'flying')).toBe(true);
  });
});
