import { describe, expect, it } from 'vitest';
import { loseLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bloodletter of Aclazotz';

describe(N, () => {
  it('no seu turno, o oponente perde o dobro da vida; o dano causado e a vida que você ganha não dobram', () => {
    const tg = setup({ battlefield: [[N, 'Serra Ascendant'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.state.players[0].life = 10;
    const ele = tg.life(1);
    loseLife(tg.g, 1, 2, null);
    expect(tg.life(1)).toBe(ele - 4);
    loseLife(tg.g, 0, 2, null);
    expect(tg.life(0)).toBe(8);
    tg.refresh();
    // Serra Ascendant 1/1 com vínculo com a vida: o oponente perde 2, você ganha 1
    tg.attack([['Serra Ascendant', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(ele - 6);
    expect(tg.life(0)).toBe(9);
    tg.passTo('upkeep', 1);
    loseLife(tg.g, 1, 2, null);
    expect(tg.life(1)).toBe(ele - 8);
  });
});