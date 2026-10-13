import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Janja, Primeira-Dama';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('as suas Auras custam {1} a menos', () => {
    // Vow of Duty custa {2}{W}: com Janja, duas Plains bastam
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], ['Elvish Mystic']], hand: [['Vow of Duty'], []], library: [lib, lib] });
    tg.choose('criatura', ['Elvish Mystic']).cast('Vow of Duty').resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });

  it('a Aura que vai do campo para o cemitério volta para a mão, uma vez por turno', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Vow of Duty', attachTo: 'Elvish Mystic' }, { name: 'Bolsa Família', attachTo: 'Llanowar Elves' }], ['Elvish Mystic', 'Llanowar Elves']],
      library: [lib, lib],
    });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Vow of Duty']);
    tg.run(destroy(tg.g, [tg.bf('Llanowar Elves')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Vow of Duty']);
    expect(tg.names(0, 'graveyard')).toEqual(['Bolsa Família']);
  });
});
