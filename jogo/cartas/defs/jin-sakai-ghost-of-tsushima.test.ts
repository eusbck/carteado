import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jin Sakai, Ghost of Tsushima';
const STANDOFF = 'Standoff — Ela ganha golpe duplo até o fim do turno';
const GHOST = 'Ghost — Ela não pode ser bloqueada neste turno';

describe(N, () => {
  it('a criatura sua que ataca sozinha um jogador ganha golpe duplo (Standoff); o dano de combate de Jin compra', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(3).fill('Island'), ['Island']] });
    const vida = tg.life(1);
    const forca = tg.pt(tg.bf(N))[0];
    tg.choose('escolha', [STANDOFF]).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida - 2 * forca);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('Ghost: não pode ser bloqueada; com duas atacando o mesmo jogador, não dispara', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Serra Angel', 'Indomitable Ancients'], ['Wall of Omens'], []] });
    tg.choose('escolha', [GHOST]).attack([[N, 1], ['Serra Angel', 2], ['Indomitable Ancients', 2]]).passTo('declareBlockers', 0);
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(N))).toBe(false);
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'double strike')).toBe(false);
  });
});