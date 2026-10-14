import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Youthful Valkyrie';

describe(N, () => {
  it('outro Angel seu que entra dá um marcador +1/+1; outras criaturas não', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Segovian Angel', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    enterCard(tg, 'Slither Blade', 0);
    enterCard(tg, 'Segovian Angel', 1);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
  });
});
