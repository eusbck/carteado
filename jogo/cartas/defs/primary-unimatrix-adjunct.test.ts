import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Primary Unimatrix Adjunct', () => {
  it('criaturas-artefato suas têm golpe duplo', () => {
    const tg = setup({ battlefield: [['Primary Unimatrix Adjunct', 'Ornithopter', 'Elvish Mystic'], ['Ornithopter']] });
    expect(hasKw(tg.g, tg.bf('Ornithopter', 0), 'double strike')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Ornithopter', 1), 'double strike')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'double strike')).toBe(false);
  });
});
