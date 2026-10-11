import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Felidar Retreat';

describe(N, () => {
  it('jogando um terreno, cria um Cat Beast 2/2 ou põe um marcador +1/+1 em cada criatura sua, com vigilância', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic']], hand: [['Forest'], []] });
    tg.choose('modo', ['Crie uma ficha de criatura Cat Beast 2/2 branca']);
    tg.play('Forest').resolveAll();
    const ficha = tg.bf('Cat Beast');
    expect(tg.pt(ficha)).toEqual([2, 2]);

    const outro = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic']], hand: [['Forest'], []] });
    outro.choose('modo', ['Coloque um marcador +1/+1 em cada criatura que você controla. Essas criaturas ganham vigilância até o fim do turno']);
    outro.play('Forest').resolveAll();
    const elfo = outro.bf('Elvish Mystic', 0);
    expect(outro.pt(elfo)).toEqual([2, 2]);
    expect(hasKw(outro.g, elfo, 'vigilance')).toBe(true);
    expect(outro.pt(outro.bf('Elvish Mystic', 1))).toEqual([1, 1]);
  });
});
