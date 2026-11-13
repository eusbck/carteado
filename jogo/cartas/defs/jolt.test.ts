import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Jolt';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('desvira o artefato alvo; compra uma carta no início da manutenção do próximo turno', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, [{ name: 'Sol Ring', tapped: true }]], hand: [[N], []], library: [['Opt', 'Ponder'], ['Forest', 'Forest']] });
    tg.pass().choose('artefato, criatura ou terreno alvo', ['Sol Ring']).yes('Jolt: desvirar', true).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
    expect(tg.names(0, 'hand')).toEqual([]);
    // o próximo turno é de Ana: compra na manutenção e depois na etapa de compra
    tg.passTo('upkeep', 0).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
});
