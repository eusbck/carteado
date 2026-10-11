import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Killmonger, Ruthless Usurper';

describe(N, () => {
  it('atropelar; ao atacar, +1/+0 por artefato do defensor; causando dano, o jogador sacrifica um artefato e você cria um Treasure', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring', 'Silver Myr']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    tg.choose('Sacrifique', ['Sol Ring']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    // 3 + 2 artefatos
    expect(tg.life(1)).toBe(35);
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
    expect(tg.all('Treasure')).toHaveLength(1);
  });

  it('sem artefatos do outro lado, não cresce, e o Treasure é criado mesmo assim', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});
