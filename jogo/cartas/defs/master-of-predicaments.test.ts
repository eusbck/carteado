import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Master of Predicaments';

describe(N, () => {
  it('com o palpite errado, você conjura a carta de graça durante a resolução', () => {
    // Zetalpa tem valor de mana 8; o oponente diz "4 ou menos"
    const tg = setup({ battlefield: [[N], []], hand: [['Zetalpa, Primal Dawn'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('escolha uma carta da sua mão', ['Zetalpa, Primal Dawn']);
    tg.yes('é maior que 4', false);
    tg.yes('palpite estava errado', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield')).not.toBeNull();
  });

  it('com o palpite certo, a carta fica na mão', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Zetalpa, Primal Dawn'], []] });
    tg.choose('escolha uma carta da sua mão', ['Zetalpa, Primal Dawn']);
    tg.yes('é maior que 4', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
    // valor de mana 4 não é maior que 4
    const quatro = setup({ battlefield: [[N], []], hand: [['Indomitable Ancients'], []] });
    quatro.choose('escolha uma carta da sua mão', ['Indomitable Ancients']);
    quatro.yes('é maior que 4', false);
    quatro.attack([[N, 1]]).passTo('main2', 0);
    expect(quatro.names(0, 'hand')).toEqual(['Indomitable Ancients']);
  });

  it('um terreno escolhido não pode ser jogado, mesmo com o palpite errado', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []] });
    tg.choose('escolha uma carta da sua mão', ['Island']);
    tg.yes('é maior que 4', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find('Island', 'battlefield')).toBeNull();
  });
});
