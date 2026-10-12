import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skorpekh Lord';

describe(N, () => {
  it('ameaçar; as outras criaturas artefato suas recebem +1/+0 e têm ameaçar', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 1]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'menace')).toBe(true);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });

  it('desenterrar {2}{B}', () => {
    const tg = setup({ battlefield: [Array(3).fill('Swamp'), []], graveyard: [[N], []] });
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
  });
});