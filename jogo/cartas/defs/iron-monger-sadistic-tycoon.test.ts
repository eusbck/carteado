import { describe, expect, it } from 'vitest';
import { connive } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Iron Monger, Sadistic Tycoon';

describe(N, () => {
  it('voar; quando uma criatura sua trama, cada Villain seu ganha um marcador +1/+1', () => {
    const lib = Array(6).fill('Swamp');
    const tg = setup({ battlefield: [[N, 'The Frightful Four', 'Elvish Mystic'], ['The Frightful Four']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    // o Elvish Mystic trama (descarta um terreno: sem marcador para ele)
    const elfo = tg.bf('Elvish Mystic');
    runEffect(tg, connive(tg.g, elfo));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    const meu = tg.all('The Frightful Four').find((x) => tg.state.objects[x].controller === 0)!;
    const dele = tg.all('The Frightful Four').find((x) => tg.state.objects[x].controller === 1)!;
    expect(tg.state.objects[meu].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[dele].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.state.objects[elfo].counters['+1/+1'] ?? 0).toBe(0);
  });
});
