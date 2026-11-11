import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const A = 'Ancient Copper Dragon';

describe(A, () => {
  it('causando dano de combate a um jogador, rola um d20 e cria essa quantidade de Tesouros', () => {
    const tg = setup({ battlefield: [[A], []], library: [['Island'], ['Island']] });
    tg.attack([[A, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(34);
    const n = tg.names(0, 'battlefield').filter((x) => x === 'Treasure').length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(20);
    expect(tg.state.log.some((l) => l.text.includes(`rola um d20 e tira ${n}`))).toBe(true);
  });
});
