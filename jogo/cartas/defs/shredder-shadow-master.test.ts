import { describe, expect, it } from 'vitest';
import { isLegendary } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shredder, Shadow Master';

describe(N, () => {
  it('atacando um jogador, cria uma cópia não lendária atacando cada outro oponente; quem leva dano de combate perde metade da vida', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('declareBlockers', 0);
    expect(tg.all(N)).toHaveLength(2);
    const ficha = tg.all(N).find((id) => tg.state.objects[id].isToken)!;
    expect(isLegendary(tg.g, ficha)).toBe(false);
    expect(tg.state.objects[ficha].tapped).toBe(true);
    expect(tg.state.combat?.attackers.find((a) => a.id === ficha)?.target).toEqual({ kind: 'player', id: 2 });
    tg.passTo('main2', 0);
    const depois = vida - 5 - Math.ceil((vida - 5) / 2);
    expect(tg.life(1)).toBe(depois);
    expect(tg.life(2)).toBe(depois);
    expect(tg.all(N)).toHaveLength(1);
  });
});