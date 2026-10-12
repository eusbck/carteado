import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Shang-Chi and the Ten Rings';

describe(N, () => {
  it('iniciativa; cada compra sua põe um marcador +1/+1; o décimo marcador compra cinco cartas e dá 5 de vida', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 8 } }], []], library: [Array(12).fill('Island'), ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'first strike')).toBe(true);
    const vida = tg.life(0);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(9);
    expect(tg.life(0)).toBe(vida);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    // a décima compra as cinco, e cada uma delas põe mais um marcador, sem disparar de novo
    expect(tg.life(0)).toBe(vida + 5);
    expect(tg.names(0, 'hand')).toHaveLength(7);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(15);
  });
});