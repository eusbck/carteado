import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Thickest in the Thicket';

describe(N, () => {
  it('dobra a força da criatura alvo com marcadores +1/+1', () => {
    const tg = fixture({ battlefield: [[...Array(5).fill('Forest'), 'Ripjaw Raptor'], []], hand: [[N], []] });
    tg.choose('criatura alvo', ['Ripjaw Raptor']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Ripjaw Raptor')].counters['+1/+1']).toBe(4);
    expect(tg.pt(tg.bf('Ripjaw Raptor'))).toEqual([8, 9]);
  });

  it('na etapa final, compra duas se você tem a maior força (empate vale); senão, não', () => {
    const empate = fixture({ battlefield: [[N, 'Ripjaw Raptor'], ['Ripjaw Raptor']] });
    empate.passTo('end');
    empate.resolveAll();
    expect(empate.state.zones.hand[0]).toHaveLength(2);
    const perde = fixture({ battlefield: [[N, 'Ripjaw Raptor'], ['Gigantosaurus']] });
    perde.passTo('end');
    perde.resolveAll();
    expect(perde.state.zones.hand[0]).toHaveLength(0);
  });
});
