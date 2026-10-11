import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Razorverge Thicket';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'W']));
  it('com zero, um ou dois outros terrenos entra desvirado; com três ou mais, virado', () => {
    expect(entraVirado(NOME)).toBe(false);
    expect(entraVirado(NOME, ['Forest'])).toBe(false);
    expect(entraVirado(NOME, ['Forest', 'Plains'])).toBe(false);
    expect(entraVirado(NOME, ['Forest', 'Plains', 'Command Tower'])).toBe(true);
  });
  it('não conta terrenos dos oponentes nem permanentes que não são terrenos', () => {
    expect(entraVirado(NOME, ['Forest', 'Sol Ring', 'Sol Ring'], [], true, ['Forest', 'Forest', 'Forest'])).toBe(false);
  });
  it('CR 614.12: não conta terrenos que entram ao mesmo tempo', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains'], []], hand: [['Island', 'Swamp', NOME], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
});
