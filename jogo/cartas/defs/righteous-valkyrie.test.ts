import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Righteous Valkyrie';

describe(N, () => {
  it('ganha vida igual à resistência da criatura que entrou', () => {
    const tg = setup({ battlefield: [[N], []] });
    // Youthful Valkyrie é Angel 1/3; Bishop of Wings é Human Cleric 1/4; Slither Blade não conta
    enterCard(tg, 'Youthful Valkyrie', 0);
    enterCard(tg, 'Bishop of Wings', 0);
    enterCard(tg, 'Slither Blade', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(47);
  });

  it('com 47 de vida (40 + 7), as suas criaturas recebem +2/+2; com 46, não', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade'], ['Baleful Strix']] });
    tg.state.players[0].life = 47;
    tg.refresh();
    expect(tg.pt(tg.bf('Slither Blade'))).toEqual([3, 4]);
    expect(tg.pt(tg.bf(N))).toEqual([4, 6]);
    expect(tg.pt(tg.bf('Baleful Strix'))).toEqual([1, 1]);
    tg.state.players[0].life = 46;
    tg.refresh();
    expect(tg.pt(tg.bf('Slither Blade'))).toEqual([1, 2]);
  });
});
