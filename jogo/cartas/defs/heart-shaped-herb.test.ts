import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Heart-Shaped Herb';

describe(N, () => {
  it('previne 1 do dano que cada fonte de um oponente causaria a você', () => {
    // Serra Angel (4) e Silver Myr (1) atacam: 3 + 0
    const tg = setup({ active: 1, battlefield: [[N], ['Serra Angel', 'Silver Myr']] });
    tg.attack([['Serra Angel', 0], ['Silver Myr', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(37);
  });

  it('sacrificado: você pode sacrificar uma criatura, que volta com três marcadores +1/+1, e você vira o monarca', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Silver Myr'], []] });
    tg.choose('Heart-Shaped Herb', ['Silver Myr']);
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
    expect(tg.state.monarch).toBe(0);
  });

  it('sem sacrificar, você não vira o monarca', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Silver Myr'], []] });
    tg.choose('Heart-Shaped Herb', []);
    tg.activate(N).resolveAll();
    expect(tg.state.monarch).toBeNull();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});