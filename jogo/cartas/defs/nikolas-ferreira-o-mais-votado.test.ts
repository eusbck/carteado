import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Nikolas Ferreira, o Mais Votado';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('ao atacar, cria um Patriota virado e atacando: 2 + 1 de dano', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    const p = tg.bf('Patriota');
    expect(tg.state.objects[p].tapped).toBe(true);
  });

  it('tem ímpeto: ataca no turno em que entra', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
  });
});
