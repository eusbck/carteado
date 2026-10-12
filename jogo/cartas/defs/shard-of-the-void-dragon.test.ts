import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shard of the Void Dragon';

describe(N, () => {
  it('atacando, cada oponente sacrifica uma permanente que não é terreno; cada artefato que sai do campo dá dois marcadores +1/+1', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Sol Ring', 'Island'], ['Elvish Mystic']] });
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Island')).not.toBeNull();
    // o Sol Ring é artefato: dois marcadores antes do dano
    expect(tg.pt(tg.bf(N))).toEqual([9, 9]);
    expect(tg.life(1)).toBe(vida - 9);
  });
});