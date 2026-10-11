import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Languish';

describe(N, () => {
  it('todas as criaturas recebem -4/-4 até o fim do turno', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-2, 6]);
  });
});
