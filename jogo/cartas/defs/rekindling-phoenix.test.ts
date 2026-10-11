import { describe, expect, it } from 'vitest';
import { destroy, exile } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rekindling Phoenix';
const FICHA = 'Elemental 0/1';

describe(N, () => {
  it('ao morrer, cria o Elemental 0/1; na sua manutenção ele é sacrificado e a Phoenix volta com ímpeto', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.pt(tg.bf(FICHA))).toEqual([0, 1]);
    // na manutenção do oponente nada acontece
    tg.passTo('main1', 1);
    expect(tg.find(FICHA)).not.toBeNull();
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(tg.find(FICHA)).toBeNull();
    const fenix = tg.bf(N);
    expect(hasKw(tg.g, fenix, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(false);
  });

  it('sem Rekindling Phoenix no cemitério, a ficha não é sacrificada e tenta de novo na manutenção seguinte', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    const noCemiterio = tg.find(N, 'graveyard', 0)!;
    tg.run(exile(tg.g, [noCemiterio]));
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.find(FICHA)).not.toBeNull();
    expect(tg.find(N)).toBeNull();
  });
});
