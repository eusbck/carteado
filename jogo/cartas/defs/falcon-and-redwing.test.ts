import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Falcon and Redwing';

describe(N, () => {
  it('voar; causando dano de combate a um jogador, cria essa quantidade de Birds 1/1 com voar e ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Bird')).toHaveLength(2);
    expect(hasKw(tg.g, tg.all('Bird')[0], 'flying')).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([3, 4]);
  });
});