import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Kang Dynasty';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('I: vira e goada uma criatura de cada oponente; quando ela causa dano de combate a um jogador, você compra', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(4).fill('Island')], ['Indomitable Ancients'], ['Elvish Mystic']], hand: [[N], [], []], library: [lib, lib, lib] });
    const anciao = tg.bf('Indomitable Ancients');
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('para cada oponente', [anciao, elfo]);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[anciao].tapped && tg.state.objects[elfo].tapped).toBe(true);
    expect(tg.state.objects[anciao].goadedBy.map((x) => x.player)).toEqual([0]);
    // no turno do Bruno, o Ancients goadado ataca a Carla e você compra uma carta
    tg.script.length = 0;
    tg.attack([[anciao, 2]]);
    tg.passTo('main2', 1);
    expect(tg.life(2)).toBe(38);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('III: a criatura alvo recebe +1/+1 por carta na sua mão e não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], hand: [['Hex', 'Hex'], []], library: [lib, lib] });
    const saga = tg.bf(N);
    tg.state.objects[saga].counters.lore = 2;
    tg.choose('para cada oponente', []).choose('criatura alvo', ['Elvish Mystic']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    const elfo = tg.bf('Elvish Mystic');
    // três cartas na mão (duas Hex e a compra do turno)
    expect(tg.pt(elfo)).toEqual([4, 4]);
    expect(tg.state.effects.some((e) => e.affected?.includes(elfo) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBeBlocked'))).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
