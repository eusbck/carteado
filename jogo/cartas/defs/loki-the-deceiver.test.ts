import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loki, the Deceiver';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('ao atacar, cria uma cópia não lendária (e Illusion) de outro Villain seu, virada e atacando, sacrificada na etapa final', () => {
    const tg = setup({ battlefield: [[N, 'The Frightful Four'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    const original = tg.bf('The Frightful Four');
    tg.choose('outro Villain alvo', ['The Frightful Four']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const ficha = tg.all('The Frightful Four').find((x) => x !== original)!;
    expect(tg.state.objects[ficha].isToken && tg.state.objects[ficha].tapped).toBe(true);
    expect(chars(tg.g, ficha).supertypes).not.toContain('Legendary');
    expect(chars(tg.g, ficha).subtypes).toEqual(expect.arrayContaining(['Villain', 'Illusion']));
    tg.passTo('main2', 0);
    // Loki 4 + ficha 4; os dois Villains causaram dano ao mesmo jogador: uma carta só
    expect(tg.life(1)).toBe(32);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    tg.passTo('main1', 1);
    expect(tg.all('The Frightful Four')).toEqual([original]);
  });

  it('sem outro Villain, o gatilho de ataque não tem alvo; o dano de combate de Loki ainda compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});
