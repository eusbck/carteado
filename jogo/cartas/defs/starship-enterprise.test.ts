import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

const N = 'Starship Enterprise';

describe(N, () => {
  it('cada terreno que entra põe quatro marcadores de carga; com 16, é criatura 4/6 com voar', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 12 } }], []], hand: [['Forest'], []] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).types).not.toContain('Creature');
    tg.play('Forest').resolveAll();
    expect(tg.state.objects[id].counters.charge).toBe(16);
    expect(chars(tg.g, id).types).toContain('Creature');
    expect(tg.pt(id)).toEqual([4, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });
  it('causando dano de combate a um jogador, compra essa quantidade de cartas', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 16 } }], []], library: [['Island', 'Island', 'Island', 'Island', 'Island'], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(36);
    expect(tg.state.zones.hand[0].length).toBe(4);
  });
});
