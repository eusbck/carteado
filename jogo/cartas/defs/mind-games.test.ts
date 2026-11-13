import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mind Games';

describe(N, () => {
  it('vira o terreno alvo; sem recompra, vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Island'], ['Forest']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('artefato, criatura ou terreno alvo', ['Forest']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('CR 702.27a: com a recompra paga, volta para a mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {2}{U}']).choose('artefato, criatura ou terreno alvo', ['Elvish Mystic']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual([N]);
  });
});
