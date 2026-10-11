import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vibranium Strike Gauntlets';

describe(N, () => {
  it('entra anexado à criatura alvo: +3/+0, atropelar e compra uma carta ao causar dano de combate a um jogador', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Silver Myr'], []], hand: [[N], []], library: [['Forest', 'Forest'], ['Forest']] });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N).resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(myr);
    expect(tg.pt(myr)).toEqual([4, 1]);
    expect(hasKw(tg.g, myr, 'trample')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});