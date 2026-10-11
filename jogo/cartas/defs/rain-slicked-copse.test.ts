import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup, entraVirado } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Rain-Slicked Copse";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","U"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('CR 702.29: ciclagem descarta e compra', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 305.6 e 305.8: tem os tipos Forest e Island, mas não é básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect(c.subtypes).toEqual(['Forest', 'Island']);
    expect(c.supertypes).toEqual([]);
    // conta para quem olha o tipo (Hinterland Harbor: Forest ou Island)…
    expect(entraVirado('Hinterland Harbor', [NOME])).toBe(false);
    // …mas não para quem procura terreno básico (Evolving Wilds)
    const busca = setup({ battlefield: [['Evolving Wilds'], []], library: [[NOME], []] });
    busca.activate('Evolving Wilds', 'Sacrifique').resolve();
    expect(busca.names(0, 'library')).toEqual([NOME]);
    expect(busca.find(NOME)).toBeNull();
  });
});
