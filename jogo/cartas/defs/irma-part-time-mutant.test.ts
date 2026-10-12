import { describe, expect, it } from 'vitest';
import { hasKw, nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Irma, Part-Time Mutant';

describe(N, () => {
  it('no início do seu combate vira cópia de outra criatura sua, com o nome e a habilidade dela, e ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []] });
    const irma = tg.bf(N);
    tg.choose('outra criatura alvo que você controla', ['Serra Angel']).passTo('main2', 0);
    expect(nameOf(tg.g, irma)).toBe(N);
    expect(tg.pt(irma)).toEqual([5, 5]);
    expect(hasKw(tg.g, irma, 'flying')).toBe(true);
    // ainda tem a habilidade: no próximo combate, sem alvo, só o marcador
    tg.choose('outra criatura alvo que você controla', []).passTo('upkeep', 1).passTo('main2', 0);
    expect(tg.pt(irma)).toEqual([6, 6]);
  });
});