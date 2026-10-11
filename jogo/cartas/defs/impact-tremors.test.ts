import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Impact Tremors';

describe(N, () => {
  it('duas criaturas entrando juntas causam 1 de dano a cada oponente duas vezes', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Cat', 2));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 38, 38]);
  });

  it('criatura do oponente e permanente que não é criatura não disparam', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 1, 'Cat', 1));
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    tg.resolveAll();
    expect(tg.life(1)).toBe(40);
  });
});
