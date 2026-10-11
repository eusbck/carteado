import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Crested Sunmare';

describe(N, () => {
  it('na etapa final de qualquer jogador, se você ganhou vida no turno, cria um Horse 5/5 indestrutível', () => {
    const tg = setup({ active: 1, battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    gainLife(tg.g, 0, 1, null);
    tg.refresh();
    tg.passTo('upkeep', 0);
    const ficha = tg.bf('Horse');
    expect(tg.pt(ficha)).toEqual([5, 5]);
    expect(hasKw(tg.g, ficha, 'indestructible')).toBe(true);
    // "outros Horses": ela mesma não fica indestrutível
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(false);
  });

  it('sem ganhar vida no turno, a habilidade não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('upkeep', 1);
    expect(tg.find('Horse')).toBeNull();
  });
});