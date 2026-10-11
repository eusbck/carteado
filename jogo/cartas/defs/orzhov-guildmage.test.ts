import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Orzhov Guildmage';

describe(N, () => {
  it('{2}{W}: o jogador alvo ganha 1 de vida; {2}{B}: cada jogador perde 1 de vida', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Swamp', 'Swamp', 'Swamp'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.choose('jogador alvo', ['Ana']).activate(N, '{2}{W}').resolveAll();
    expect(tg.life(0)).toBe(41);
    tg.activate(N, '{2}{B}').resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(39);
  });
});