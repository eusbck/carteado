import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Stroke of Midnight', () => {
  it('destrói o permanente não terreno alvo; o controlador dele cria uma ficha Human 1/1 branca', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Sol Ring']], hand: [['Stroke of Midnight'], []] });
    tg.choose('permanente não terreno alvo', ['Sol Ring']).cast('Stroke of Midnight').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    const humano = tg.bf('Human', 1);
    expect(tg.pt(humano)).toEqual([1, 1]);
    expect(chars(tg.g, humano).colors).toEqual(['W']);
    expect(tg.find('Human', 'battlefield', 0)).toBeNull();
  });

  it('alvo indestrutível não é destruído, mas o controlador cria a ficha Human', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Grand Crescendo', 'Stroke of Midnight'], []] });
    // Grand Crescendo cria um Citizen indestrutível de Ana, que vira o alvo
    tg.number('valor de X', 1).cast('Grand Crescendo').resolve();
    const cidadao = tg.bf('Citizen', 0);
    tg.choose('permanente não terreno alvo', [cidadao]).cast('Stroke of Midnight').resolve();
    expect(tg.find('Citizen')).toBe(cidadao);
    expect(tg.find('Human', 'battlefield', 0)).not.toBeNull();
  });

  it('CR 608.2b: com o alvo ilegal, a mágica não resolve e ninguém cria a ficha', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Wall of Omens', 'Plains']], hand: [['Stroke of Midnight'], ['Swords to Plowshares']] });
    tg.choose('permanente não terreno alvo', ['Wall of Omens']).cast('Stroke of Midnight').pass();
    // Bruno responde exilando o próprio alvo
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Swords to Plowshares').resolve();
    tg.resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(1, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.all('Human').length).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Stroke of Midnight']);
  });
});
