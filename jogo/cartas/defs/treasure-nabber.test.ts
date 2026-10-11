import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/api.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Treasure Nabber';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('o artefato virado para mana por um oponente passa a ser seu, ainda virado, até o fim do seu próximo turno', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Sol Ring', 'Mountain']], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    const anel = tg.bf('Sol Ring');
    activateMana(tg, 'Mountain', 'R');
    expect(tg.state.zones.stack).toHaveLength(0);
    activateMana(tg, 'Sol Ring', 'C');
    tg.resolveAll();
    expect(controllerOf(tg.g, anel)).toBe(0);
    expect(tg.state.objects[anel].tapped).toBe(true);
    // fica com você no seu próximo turno e volta depois dele
    tg.passTo('main1', 0);
    expect(controllerOf(tg.g, anel)).toBe(0);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anel)).toBe(1);
  });
});
