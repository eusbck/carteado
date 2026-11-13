import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Awaken the Woods';

describe(N, () => {
  it('cria X fichas Forest Dryad 1/1, criaturas terreno com enjoo de invocação', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.number('X', 3).cast(N).resolve();
    const dr = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Forest Dryad');
    expect(dr.length).toBe(3);
    expect(tg.pt(dr[0])).toEqual([1, 1]);
    // CR 302.6: sem desvirar desde o começo do turno, não pode usar {T}
    expect(manaOptions(tg.g, 0).some((o) => o.obj === dr[0])).toBe(false);
  });
});
