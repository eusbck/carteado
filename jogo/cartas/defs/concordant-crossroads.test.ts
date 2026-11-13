import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Concordant Crossroads';

describe(N, () => {
  it('todas as criaturas têm ímpeto, também as do oponente', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens'], ['Indomitable Ancients']] });
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(true);
  });
  it('CR 704.5k — regra do mundo: a mais nova fica, a anterior vai para o cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N).length).toBe(1);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
