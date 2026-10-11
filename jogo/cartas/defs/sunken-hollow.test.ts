import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = "Sunken Hollow";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","U"]));
  it('entra virado com menos de dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Swamp'])).toBe(false));
  it('CR 305.8: não é básico; dois deles não fazem outro entrar desvirado', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual([]);
    const dois = setup({ battlefield: [[NOME, NOME], []], hand: [[NOME], []] });
    const antes = dois.all(NOME);
    dois.play(NOME);
    const novo = dois.all(NOME).find((id) => !antes.includes(id))!;
    expect(dois.state.objects[novo].tapped).toBe(true);
  });
  it('CR 614.12: terrenos básicos que entram ao mesmo tempo não contam', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Island', 'Swamp', NOME], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
  });
  it('CR 305.6: tem os tipos Island e Swamp (conta para quem procura esses tipos)', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Island', 'Swamp']);
    // Drowned Catacomb olha os tipos Island e Swamp, sem exigir básico
    expect(entraVirado('Drowned Catacomb', [NOME])).toBe(false);
  });
});
