// N27: a igualdade rasa dos seletores da loja (cliente/src/igualdade.ts): um seletor que devolve um objeto novo a cada
// chamada só redesenha quem assina quando algum campo mudou de referência.
import { describe, expect, it } from 'vitest';
import { rasa } from '../cliente/src/igualdade.ts';

describe('rasa', () => {
  it('compara valores, objetos e listas campo a campo, por referência', () => {
    const vista = { turn: 1 };
    expect(rasa(1, 1)).toBe(true);
    expect(rasa(NaN, NaN)).toBe(true);
    expect(rasa(null, null)).toBe(true);
    expect(rasa<unknown>(null, {})).toBe(false);
    expect(rasa({ vista, n: 2 }, { vista, n: 2 })).toBe(true);
    // o mesmo conteúdo noutra referência conta como mudança (a loja compartilha o que não mudou)
    expect(rasa({ vista }, { vista: { turn: 1 } })).toBe(false);
    expect(rasa({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(rasa({ a: 1, b: undefined }, { a: 1, c: undefined })).toBe(false);
    expect(rasa([vista, 1], [vista, 1])).toBe(true);
    expect(rasa([1], { 0: 1 })).toBe(false);
    expect(rasa([1, 2], [1])).toBe(false);
  });
});
