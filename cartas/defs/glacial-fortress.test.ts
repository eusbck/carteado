import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Glacial Fortress';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['U', 'W']));
  it('entra virado sem Plains nem Island', () => expect(entraVirado(NOME, ['Sol Ring', 'Command Tower'])).toBe(true));
  it('entra desvirado com Plains', () => expect(entraVirado(NOME, ['Plains'])).toBe(false));
  it('entra desvirado com Island', () => expect(entraVirado(NOME, ['Island'])).toBe(false));
  it('CR 614.12: não vê terrenos que entram ao mesmo tempo', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Plains', NOME], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('CR 305.8: conta o tipo de terreno, inclusive de terreno não básico', () => {
    // Turbulent Shore é Plains Island sem ser básico
    expect(entraVirado(NOME, ['Turbulent Shore'])).toBe(false);
  });
  it('não conta terrenos dos oponentes', () => expect(entraVirado(NOME, [], [], true, ['Plains', 'Island'])).toBe(true));
});
