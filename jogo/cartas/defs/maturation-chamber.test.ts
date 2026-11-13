import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Maturation Chamber';

describe(N, () => {
  it('cada mágica de artefato conjurada dá um marcador de carga; {4}, {T}: uma ficha Borg por marcador', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Plains')], []], hand: [['Sol Ring', 'Wall of Omens'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(1);
    tg.activate(N, 'Crie').resolveAll();
    expect(tg.all('Borg')).toHaveLength(1);
  });
});
