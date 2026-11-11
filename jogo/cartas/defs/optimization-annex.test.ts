import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Optimization Annex';

describe(N, () => {
  it('marcadores de carga num artefato seu viram essa quantidade mais um, também ao entrar', () => {
    const tg = setup({ battlefield: [[N, 'Maturation Chamber', 'Plains', 'Plains', 'Plains'], []], hand: [['Sol Ring', 'Reconnaissance Partition'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf('Maturation Chamber')].counters.charge).toBe(2);
    tg.cast('Reconnaissance Partition').resolveAll();
    expect(tg.state.objects[tg.bf('Reconnaissance Partition')].counters.charge).toBe(3);
  });
});
