import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Sodden Verdure";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","U"]));
  it('entra virado com menos de dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Swamp'])).toBe(false));
  it('CR 305.6 e 305.8: tem os tipos Forest e Island, mas não é básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect(c.subtypes).toEqual(['Forest', 'Island']);
    expect(c.supertypes).toEqual([]);
    // não conta como básico para outro igual…
    const dois = setup({ battlefield: [[NOME, NOME], []], hand: [[NOME], []] });
    const antes = dois.all(NOME);
    dois.play(NOME);
    const novo = dois.all(NOME).find((id) => !antes.includes(id))!;
    expect(dois.state.objects[novo].tapped).toBe(true);
    // …conta para quem olha o tipo (Hinterland Harbor: Forest ou Island)…
    expect(entraVirado('Hinterland Harbor', [NOME])).toBe(false);
    // …e não é achado por quem procura terreno básico (Evolving Wilds)
    const busca = setup({ battlefield: [['Evolving Wilds'], []], library: [[NOME], []] });
    busca.activate('Evolving Wilds', 'Sacrifique').resolve();
    expect(busca.names(0, 'library')).toEqual([NOME]);
  });
});
