import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Suture Priest';

describe(N, () => {
  it('outra criatura sua entrando: você pode ganhar 1 de vida; criatura de um oponente: ele pode perder 1 de vida', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.yes('ganhar 1 de vida', true);
    enterCard(tg, 'Silver Myr', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
    tg.yes('perder 1 de vida', true);
    enterCard(tg, 'Elvish Mystic', 1);
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });

  it('as duas são opcionais', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.yes('ganhar 1 de vida', false).yes('perder 1 de vida', false);
    enterCard(tg, 'Silver Myr', 0);
    enterCard(tg, 'Elvish Mystic', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(40);
  });
});