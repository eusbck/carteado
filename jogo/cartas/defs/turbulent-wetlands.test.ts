import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Turbulent Wetlands';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'U']));
  it('entra virado se os oponentes têm menos de oito terrenos', () => expect(entraVirado(NOME, Array(9).fill('Forest'), [], true, Array(7).fill('Forest'))).toBe(true));
  it('entra desvirado se os oponentes têm oito ou mais terrenos', () => expect(entraVirado(NOME, [], [], true, Array(8).fill('Forest'))).toBe(false));
  it('soma os terrenos de todos os oponentes', () => {
    const tg = setup({ players: 3, battlefield: [[], Array(4).fill('Forest'), Array(4).fill('Island')], hand: [[NOME], [], []] });
    tg.play(NOME);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
  it('CR 305.6 e 305.8: tem os tipos Island e Swamp sem ser básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect(c.subtypes).toEqual(['Island', 'Swamp']);
    expect(c.supertypes).toEqual([]);
    // Drowned Catacomb olha o tipo de terreno
    expect(entraVirado('Drowned Catacomb', [NOME])).toBe(false);
  });
  it('CR 614.12: terrenos dos oponentes que entram ao mesmo tempo não contam', () => {
    const tg = setup({ battlefield: [[], Array(7).fill('Forest')], hand: [[NOME], ['Forest']] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.state.zones.hand[1][0], controller: 1 }, { id: tg.state.zones.hand[0][0], controller: 0 }], 'teste'));
    expect(tg.all('Forest').length).toBe(8);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
