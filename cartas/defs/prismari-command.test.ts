import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const terrenos = ['Island', 'Mountain', 'Mountain'];

describe('Prismari Command', () => {
  it('dois modos: 2 de dano e o jogador alvo cria um Tesouro', () => {
    const tg = setup({ battlefield: [terrenos, ['Elvish Mystic']], hand: [['Prismari Command'], []] });
    tg.choose('modo', ['Causa 2 de dano a qualquer alvo', 'O jogador alvo cria uma ficha de Tesouro']);
    tg.choose('qualquer alvo', ['Elvish Mystic']).choose('jogador alvo que cria', ['Ana']);
    tg.cast('Prismari Command').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.all('Treasure').length).toBe(1);
  });
  it('com um alvo ilegal, os outros modos ainda acontecem', () => {
    const tg = setup({ battlefield: [terrenos, ['Sol Ring', 'Elvish Mystic', 'Viscera Seer']], hand: [['Prismari Command'], []], library: [[], ['Island']] });
    tg.choose('modo', ['Causa 2 de dano a qualquer alvo', 'Destrua o artefato alvo']);
    tg.choose('qualquer alvo', ['Elvish Mystic']).choose('artefato alvo', ['Sol Ring']);
    tg.cast('Prismari Command').pass();
    // Bruno responde sacrificando o alvo do dano
    tg.choose('Sacrifique', ['Elvish Mystic']).activate('Viscera Seer').resolve();
    tg.resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Sol Ring']);
  });
});
