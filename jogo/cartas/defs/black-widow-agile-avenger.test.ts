import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Black Widow, Agile Avenger';

describe(N, () => {
  it('ameaçar; a segunda compra de um oponente no turno dá um marcador +1/+1 e uma carta para você', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Island', 'Island'], Array(4).fill('Island')] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    runEffect(tg, draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    runEffect(tg, draw(tg.g, 1, 2));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});