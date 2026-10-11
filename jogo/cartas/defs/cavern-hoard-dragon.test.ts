import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as artefatos } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Cavern-Hoard Dragon';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('custa {X} a menos, com X o maior número de artefatos de um oponente', () => {
    // {7}{R}{R} com três artefatos do oponente: seis Mountains bastam
    const tg = setup({ battlefield: [[...Array(6).fill('Mountain')], ['Sol Ring', 'Silver Myr', 'Basalt Monolith']], hand: [[N], []], library: [lib, lib] });
    expect(tg.canCast(N)).toBe(true);
    const sem = setup({ battlefield: [[...Array(6).fill('Mountain')], ['Sol Ring']], hand: [[N], []], library: [lib, lib] });
    expect(sem.canCast(N)).toBe(false);
  });

  it('causando dano de combate, cria um Treasure para cada artefato do jogador', () => {
    const tg = artefatos({ battlefield: [[N], ['Sol Ring', 'Basalt Monolith']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    for (const kw of ['flying', 'trample', 'haste']) expect(hasKw(tg.g, id, kw)).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(2);
  });
});
