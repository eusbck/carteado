import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Whitemane Lion';

describe(N, () => {
  it('devolve uma criatura sua escolhida na resolução, sem alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('Whitemane Lion', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
  });

  it('pode devolver a si mesmo; sem outra criatura, é obrigado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Elvish Mystic']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([N]);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
