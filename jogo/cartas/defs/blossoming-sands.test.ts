import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, jogarTerreno } from '../../testes/padroes.ts';

const NOME = "Blossoming Sands";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["G","W"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('quando entra, você ganha 1 de vida (gatilho na pilha)', () => {
    const tg = jogarTerreno(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.life(0)).toBe(40);
    tg.resolve();
    expect(tg.life(0)).toBe(41);
  });
});
