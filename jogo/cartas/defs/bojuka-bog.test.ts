import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, jogarTerreno } from '../../testes/padroes.ts';
import { setup } from '../../testes/harness.ts';

describe('Bojuka Bog', () => {
  it('{T}: adiciona {B}', () => expect(alternativasDeMana('Bojuka Bog')).toEqual(['B']));
  it('entra virado', () => expect(entraVirado('Bojuka Bog')).toBe(true));
  it('ao entrar, exila o cemitério do jogador alvo', () => {
    const tg = setup({ hand: [['Bojuka Bog'], []], graveyard: [['Plains'], ['Wall of Omens', 'Sol Ring']] });
    tg.choose('jogador alvo', ['Bruno']).play('Bojuka Bog').resolve();
    expect(tg.state.zones.graveyard[1].length).toBe(0);
    expect(tg.names(1, 'exile').sort()).toEqual(['Sol Ring', 'Wall of Omens']);
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
    void jogarTerreno;
  });
});
