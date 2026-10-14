import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { removeCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Collective Resistance';

describe(N, () => {
  it('com os três modos, paga {G}{G} a mais; se o alvo de um ficar ilegal, os outros acontecem', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest'), 'Ripjaw Raptor'], ['Sol Ring', 'Colossal Majesty']], hand: [[N], []] });
    tg.choose('modo', ['Destrua o artefato alvo', 'Destrua o encantamento alvo', 'A criatura alvo ganha resistência a magia e indestrutível até o fim do turno']);
    tg.choose('artefato alvo', ['Sol Ring']);
    tg.choose('encantamento alvo', ['Colossal Majesty']);
    tg.choose('criatura alvo', ['Ripjaw Raptor']);
    tg.cast(N);
    // os quatro Forests pagaram {1}{G} + {G}{G}
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Forest' && tg.state.objects[id].tapped)).toHaveLength(4);
    // o Sol Ring sai do campo antes de a mágica resolver: o alvo dele fica ilegal
    removeCard(tg, tg.bf('Sol Ring'));
    tg.resolve();
    expect(tg.find('Colossal Majesty')).toBeNull();
    expect(hasKw(tg.g, tg.bf('Ripjaw Raptor'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Ripjaw Raptor'), 'indestructible')).toBe(true);
  });

  it('com um modo só, não paga a escalada', () => {
    const tg = setup({ battlefield: [[...Array(2).fill('Forest')], ['Sol Ring']], hand: [[N], []] });
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']).cast(N).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
