import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Raise the Palisade';

describe(N, () => {
  it('devolve à mão dos donos todas as criaturas que não são do tipo escolhido', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Island'), 'Silver Myr', 'Elvish Mystic'], ['Serra Angel', 'Silver Myr']], hand: [[N], []] });
    tg.choose('escolha um tipo de criatura', ['Myr']).cast(N).resolveAll();
    expect(tg.all('Silver Myr')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'hand')).toEqual(['Serra Angel']);
  });
});