import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Drowned Catacomb';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'U']));
  it('entra virado sem Island nem Swamp', () => expect(entraVirado(NOME, ['Sol Ring', 'Command Tower'])).toBe(true));
  it('entra desvirado com Island', () => expect(entraVirado(NOME, ['Island'])).toBe(false));
  it('entra desvirado com Swamp', () => expect(entraVirado(NOME, ['Swamp'])).toBe(false));
  it('CR 614.12: não vê terrenos que entram ao mesmo tempo', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Island', NOME], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('CR 305.8: conta o tipo de terreno, inclusive de terreno não básico', () => {
    // Turbulent Wetlands é Island Swamp sem ser básico
    expect(entraVirado(NOME, ['Turbulent Wetlands'])).toBe(false);
  });
  it('não conta terrenos dos oponentes', () => expect(entraVirado(NOME, [], [], true, ['Island', 'Swamp'])).toBe(true));
});
