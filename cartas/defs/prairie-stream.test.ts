import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Prairie Stream';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['U', 'W']));
  it('entra virado com menos de dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Command Tower'])).toBe(true));
  it('entra desvirado com dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Swamp'])).toBe(false));
  it('CR 614.12: terrenos básicos que entram ao mesmo tempo não contam', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Plains', 'Island', NOME], []] });
    const mao = tg.state.zones.hand[0];
    tg.run(putOntoBattlefield(tg.g, mao.map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
  });
  it('CR 305.6: tem os tipos Plains e Island (conta para quem procura esses tipos)', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect(c.subtypes).toEqual(['Plains', 'Island']);
    // Isolated Chapel olha só o tipo Plains
    expect(entraVirado('Isolated Chapel', [NOME])).toBe(false);
  });
  it('CR 305.8: não é básico; dois deles não fazem outro entrar desvirado', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual([]);
    const dois = setup({ battlefield: [[NOME, NOME], []], hand: [[NOME], []] });
    dois.play(NOME);
    const novo = dois.all(NOME).find((id) => dois.state.objects[id].controlledSince === dois.state.turn.number)!;
    expect(dois.all(NOME).length).toBe(3);
    expect(dois.state.objects[novo].tapped).toBe(true);
  });
});
