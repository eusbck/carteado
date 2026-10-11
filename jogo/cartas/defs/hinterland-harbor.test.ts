import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = "Hinterland Harbor";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","U"]));
  it('entra virado sem Forest nem Island', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com Forest', () => expect(entraVirado(NOME, ['Forest'])).toBe(false));
  it('entra desvirado com Island', () => expect(entraVirado(NOME, ['Island'])).toBe(false));
  it('CR 305.6: conta o tipo de terreno de um terreno não básico', () => expect(entraVirado(NOME, ['Rain-Slicked Copse'])).toBe(false));
  it('não conta terrenos dos oponentes', () => expect(entraVirado(NOME, [], [], true, ['Forest', 'Island'])).toBe(true));
  it('CR 614.12: não vê terrenos que entram ao mesmo tempo', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Forest', NOME], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
