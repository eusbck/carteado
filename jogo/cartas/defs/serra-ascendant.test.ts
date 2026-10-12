import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Serra Ascendant';

describe(N, () => {
  it('vínculo com a vida; com 30 ou mais de vida recebe +5/+5 e voar', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    tg.state.players[0].life = 29;
    tg.refresh();
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    tg.state.players[0].life = 30;
    tg.refresh();
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });
});