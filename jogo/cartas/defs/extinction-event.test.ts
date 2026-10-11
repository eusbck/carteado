import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Extinction Event';
// Elvish Mystic (1), Silver Myr (2), Indomitable Ancients (4)
const campo = (): [string[], string[]] => [[...Array(4).fill('Swamp'), 'Elvish Mystic'], ['Silver Myr', 'Indomitable Ancients']];

describe(N, () => {
  it('par exila as criaturas de valor de mana par, fichas inclusive (valor 0); ímpar, as de valor ímpar', () => {
    const par = setup({ battlefield: campo(), hand: [[N], []] });
    par.run(createTokens(par.g, 1, 'Cat', 1));
    par.choose('ímpar ou par', ['par']).cast(N).resolveAll();
    expect(par.find('Elvish Mystic')).not.toBeNull();
    expect(par.names(1, 'battlefield')).toEqual([]);

    const impar = setup({ battlefield: campo(), hand: [[N], []] });
    impar.choose('ímpar ou par', ['impar']).cast(N).resolveAll();
    expect(impar.find('Elvish Mystic')).toBeNull();
    expect(impar.names(1, 'battlefield').sort()).toEqual(['Indomitable Ancients', 'Silver Myr']);
    expect(impar.names(0, 'exile')).toEqual(['Elvish Mystic']);
  });
});
