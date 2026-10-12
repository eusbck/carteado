import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jocasta, Automaton Avenger';

describe(N, () => {
  it('o seu comandante causando dano de combate a um jogador põe um marcador +1/+1 nela', () => {
    const tg = setup({ battlefield: [[N, { name: 'Serra Angel', commander: true }, 'Indomitable Ancients'], []] });
    tg.attack([['Serra Angel', 1], ['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });

  it('do cemitério: quando você ataca com o seu comandante, pode voltar ao campo virada e atacando', () => {
    const tg = setup({ battlefield: [[{ name: 'Serra Angel', commander: true }], []], graveyard: [[N], []] });
    const vida = tg.life(1);
    tg.yes('Jocasta', true).attack([['Serra Angel', 1]]).passTo('declareBlockers', 0);
    const j = tg.bf(N);
    expect(tg.state.objects[j].tapped).toBe(true);
    expect(tg.state.combat?.attackers.some((a) => a.id === j)).toBe(true);
    tg.passTo('main2', 0);
    // 4 do Serra Angel, 2 da Jocasta; o dano do comandante ainda dá um marcador a ela
    expect(tg.life(1)).toBe(vida - 6);
    expect(tg.pt(j)).toEqual([3, 3]);
  });
});