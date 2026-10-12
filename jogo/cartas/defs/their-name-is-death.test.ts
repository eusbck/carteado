import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Their Name Is Death';

describe(N, () => {
  it('destrói todas as criaturas que não são artefato', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp'), 'Silver Myr', 'Elvish Mystic'], ['Serra Angel', 'Cryptothrall']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Cryptothrall')).not.toBeNull();
  });
});