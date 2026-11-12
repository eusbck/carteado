import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Moonblade Shinobi';

describe(N, () => {
  it('com dano de combate, cria uma Illusion 1/1 azul voadora', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const ficha = tg.bf('Illusion');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(hasKw(tg.g, ficha, 'flying')).toBe(true);
  });
});
