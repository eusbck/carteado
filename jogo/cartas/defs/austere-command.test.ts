import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Austere Command';

describe(N, () => {
  it('dois modos em sequência: artefatos e criaturas de valor de mana 4 ou mais', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains'), 'Sol Ring', 'Elvish Mystic'], ['Serra Angel', 'Silver Myr', 'High Score']], hand: [[N], []] });
    tg.choose('escolha', ['Destrua todos os artefatos', 'Destrua todas as criaturas com valor de mana 4 ou mais']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('High Score')).not.toBeNull();
  });
});