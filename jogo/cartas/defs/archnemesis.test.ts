import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Archnemesis';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('encanta um oponente; atacando esse jogador, ele perde 2 de vida, você compra uma carta e ganha 2', () => {
    const tg = setup({ players: 3, battlefield: [['Island', 'Swamp', 'Island', 'Elvish Mystic'], [], []], hand: [[N], [], []], library: [lib, lib, lib] });
    tg.choose('oponente', ['Bruno']).cast(N).resolveAll();
    const aura = tg.bf(N);
    expect(tg.state.objects[aura].data.enchantedPlayer).toBe(1);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('atacando outro jogador, não dispara; quando um jogador ataca você, a Aura pode passar para ele', () => {
    const tg = setup({ players: 3, battlefield: [['Island', 'Swamp', 'Island', 'Elvish Mystic'], [], ['Silver Myr']], hand: [[N], [], []], library: [lib, lib, lib] });
    tg.choose('oponente', ['Bruno']).cast(N).resolveAll();
    const aura = tg.bf(N);
    tg.attack([['Elvish Mystic', 2]]).passTo('main2', 0);
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 40, 39]);
    // a Carla ataca você: a Aura passa para ela
    tg.script.length = 0;
    tg.yes('Archnemesis', true);
    tg.passTo('main1', 2);
    tg.attack([['Silver Myr', 0]]);
    tg.passTo('main2', 2);
    expect(tg.state.objects[aura].data.enchantedPlayer).toBe(2);
    expect(tg.find(N)).not.toBeNull();
  });
});
