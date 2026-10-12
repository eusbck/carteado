import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wave Goodbye';

describe(N, () => {
  it('devolve à mão dos donos as criaturas sem marcador +1/+1', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), { name: 'Silver Myr', counters: { '+1/+1': 1 } }, 'Elvish Mystic'], ['Serra Angel']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'hand')).toEqual(['Serra Angel']);
  });
});