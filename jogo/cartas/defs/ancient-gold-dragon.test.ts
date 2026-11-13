import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

const A = 'Ancient Gold Dragon';

describe(A, () => {
  it('causando dano de combate a um jogador, rola um d20 e cria essa quantidade de Faerie Dragons 1/1 com voar', () => {
    const tg = setup({ battlefield: [[A], []], library: [['Island'], ['Island']] });
    tg.attack([[A, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(33);
    const fadas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Faerie Dragon');
    expect(fadas.length).toBeGreaterThanOrEqual(1);
    expect(fadas.length).toBeLessThanOrEqual(20);
    expect(tg.pt(fadas[0])).toEqual([1, 1]);
    expect(hasKw(tg.g, fadas[0], 'flying')).toBe(true);
    expect(tg.state.log.some((l) => l.text.includes(`rola um d20 e tira ${fadas.length}`))).toBe(true);
  });
});
