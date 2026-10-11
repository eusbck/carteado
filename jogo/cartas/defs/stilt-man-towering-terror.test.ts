import { describe, expect, it } from 'vitest';
import { controllerOf, sacrifice } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Stilt-Man, Towering Terror';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('alcance; com dano de combate de um Villain seu, rouba um permanente não criatura e não terreno até o fim do seu próximo turno, e ele não pode ser sacrificado', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring', 'Island']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 2]);
    expect(hasKw(tg.g, id, 'reach')).toBe(true);
    const anel = tg.bf('Sol Ring');
    tg.choose('permanente alvo', ['Sol Ring']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(controllerOf(tg.g, anel)).toBe(0);
    runEffect(tg, sacrifice(tg.g, [anel]));
    expect(tg.state.objects[anel]?.zone).toBe('battlefield');
    // continua seu no turno do oponente e no seu próximo turno; volta depois
    tg.script.length = 0;
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anel)).toBe(0);
    tg.passTo('main1', 0);
    expect(controllerOf(tg.g, anel)).toBe(0);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anel)).toBe(1);
    runEffect(tg, sacrifice(tg.g, [anel]));
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });

  it('criatura que não é Villain não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Sol Ring']], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });
});
