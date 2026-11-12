import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Bilbo's Gambit";

describe(N, () => {
  it('com o presente, o oponente cria um Treasure, a mágica volta para a mão e ninguém conjura mais neste turno', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Plains', 'Plains'], ['Forest', 'Forest', 'Forest', 'Forest']],
      hand: [[N], ['Woodland Bellower', 'Llanowar Elves']],
    });
    tg.cast('Llanowar Elves');
    tg.pass();
    tg.choose('prometer', ['Prometer a Bruno']).cast(N);
    tg.resolve();
    expect(tg.names(1, 'hand').sort()).toEqual(['Llanowar Elves', 'Woodland Bellower']);
    expect(tg.find('Treasure', 'battlefield', 1)).not.toBeNull();
    expect(tg.canCast('Llanowar Elves')).toBe(false);
  });
  it('sem o presente, só devolve a mágica', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Plains'], ['Forest', 'Forest']], hand: [[N], ['Llanowar Elves', 'Elvish Mystic']] });
    tg.cast('Llanowar Elves');
    tg.pass();
    tg.choose('prometer', ['Não prometer']).cast(N);
    tg.resolve();
    expect(tg.find('Treasure')).toBeNull();
    expect(tg.canCast('Elvish Mystic')).toBe(true);
  });
});
