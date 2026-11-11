import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Infuse';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('desvira o terreno alvo', () => {
    const tg = setup({ battlefield: [[...ilhas, { name: 'Forest', tapped: true }], []], hand: [[N], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Forest']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
  it('o alvo já desvirado não muda, e a compra da próxima manutenção acontece', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []], library: [['Forest'], ['Opt', 'Ponder']] });
    tg.choose('artefato, criatura ou terreno alvo', ['Elvish Mystic']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    // no turno do oponente: Ana compra na manutenção dele
    tg.passTo('upkeep', 1).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
