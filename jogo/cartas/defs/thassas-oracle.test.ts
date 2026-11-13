import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Thassa's Oracle";

describe(NOME, () => {
  it('com o grimório vazio, você vence o jogo', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('a devoção conta os símbolos azuis; genérico não conta', () => {
    // Oracle {U}{U} + Daze em campo não conta (está na mão); Mental Misstep não é permanente: devoção 2, grimório 2
    const tg = setup({ battlefield: [['Island', 'Island', 'Sol Ring'], []], hand: [[NOME], []], library: [['Forest', 'Plains'], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('com devoção menor que o grimório, olha X cartas, deixa uma no topo e não vence', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[NOME], []], library: [['Forest', 'Plains', 'Swamp', 'Mountain'], []] });
    tg.choose('Thassa', ['Plains']).cast(NOME).resolveAll();
    expect(tg.state.gameOver).toBeNull();
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Plains');
    expect(lib.slice(1, 3)).toEqual(['Swamp', 'Mountain']);
    expect(lib[3]).toBe('Forest');
  });
});
