import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Witherbloom Command', () => {
  it('mirando você mesmo, pode devolver um terreno que acabou de moer', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], []], hand: [['Witherbloom Command'], []], library: [['Island', 'Wall of Omens', 'Plains'], []] });
    tg.choose('modo', ['O jogador alvo moi três cartas e depois você devolve uma carta de terreno do seu cemitério para a mão', 'O oponente alvo perde 2 de vida e você ganha 2 de vida']);
    tg.choose('jogador alvo que moi', ['Ana']).choose('devolva uma carta de terreno', ['Plains']);
    tg.cast('Witherbloom Command').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
  it('com um alvo ilegal, os outros modos ainda acontecem', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], ['Sol Ring', 'Elvish Mystic', 'Viscera Seer']], hand: [['Witherbloom Command'], []], library: [[], ['Island']] });
    tg.choose('modo', ['Destrua o permanente não criatura e não terreno alvo com valor de mana 2 ou menos', 'A criatura alvo recebe -3/-1 até o fim do turno']);
    tg.choose('valor de mana 2 ou menos', ['Sol Ring']).choose('criatura alvo', ['Elvish Mystic']);
    tg.cast('Witherbloom Command').pass();
    // Bruno sacrifica o alvo da criatura em resposta: esse alvo fica ilegal
    tg.choose('Sacrifique', ['Elvish Mystic']).activate('Viscera Seer').resolve();
    tg.resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
