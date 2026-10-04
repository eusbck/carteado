import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Legions to Ashes', () => {
  it('exila o alvo e as fichas de mesmo nome que esse jogador controla', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Swamp', 'Sol Ring'], [], []], hand: [['Legions to Ashes'], [], []] });
    tg.run(createTokens(tg.g, 1, 'Saproling', 3));
    tg.run(createTokens(tg.g, 2, 'Saproling', 1));
    tg.choose('oponente controla', [tg.all('Saproling').find((id) => tg.state.objects[id].controller === 1)!]).cast('Legions to Ashes').resolve();
    expect(tg.all('Saproling').length).toBe(1); // a de Carla fica
  });
  it('o alvo não precisa ser ficha', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Sol Ring'], ['Wall of Omens']], hand: [['Legions to Ashes'], []] });
    tg.choose('oponente controla', ['Wall of Omens']).cast('Legions to Ashes').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Wall of Omens']);
  });
});
