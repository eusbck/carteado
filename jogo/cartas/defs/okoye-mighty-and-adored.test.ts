import { describe, expect, it } from 'vitest';
import { becomeMonarch } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Okoye, Mighty and Adored';

describe(N, () => {
  it('entrando, você vira o monarca', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.state.monarch).toBe(0);
  });

  it('no início do combate, um marcador +1/+1 na criatura alvo; atacando o monarca, ela ganha golpe duplo e atropelar', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    becomeMonarch(tg.g, 1);
    tg.refresh();
    tg.choose('criatura alvo', ['Silver Myr']);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([2, 2]);
    expect(hasKw(tg.g, myr, 'double strike')).toBe(true);
    expect(hasKw(tg.g, myr, 'trample')).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });

  it('atacando quem não é o monarca, só o marcador', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    tg.choose('criatura alvo', ['Silver Myr']);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'double strike')).toBe(false);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
  });
});