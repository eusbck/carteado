import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe("Rogue's Passage", () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana("Rogue's Passage")).toEqual(['C']));
  it('a criatura alvo não pode ser bloqueada neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [["Rogue's Passage", 'Sol Ring', 'Sol Ring', 'Zetalpa, Primal Dawn'], ['Arboreal Grazer']] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).activate("Rogue's Passage", 'bloqueada').resolve();
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(32);
  });
});
