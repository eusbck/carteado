import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cleansing Nova';
const campo = (): [string[], string[]] => [[...Array(5).fill('Plains'), 'Elvish Mystic', 'Sol Ring'], ['Indomitable Ancients', 'Bitter Reunion', 'Silver Myr']];

describe(N, () => {
  it('destrói todas as criaturas', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []] });
    tg.choose('modo', ['Destrua todas as criaturas']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Plains')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'battlefield')).toEqual(['Bitter Reunion']);
  });

  it('destrói todos os artefatos e encantamentos, inclusive as criaturas artefato', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []] });
    tg.choose('modo', ['Destrua todos os artefatos e encantamentos']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Plains')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
  });
});
