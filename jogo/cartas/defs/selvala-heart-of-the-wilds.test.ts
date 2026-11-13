import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const S = 'Selvala, Heart of the Wilds';

describe(S, () => {
  it('{G}, {T}: X manas, onde X é a maior força entre as suas criaturas', () => {
    // Zetalpa 4/8: quatro manas de cores a escolher
    expect(alternativasDeMana(S, ['Zetalpa, Primal Dawn', 'Forest'])).toEqual(['****']);
  });
  it('compra só quem tem a criatura mais forte; com empate, ninguém', () => {
    const tg = setup({ battlefield: [[S, 'Indomitable Ancients'], []], hand: [[], ['Zetalpa, Primal Dawn', 'Elvish Mystic']], library: [[], ['Island', 'Island']] });
    // Zetalpa (4) do oponente: maior que todas; quem a controla (Bruno) compra
    tg.yes('comprar uma carta', true);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Zetalpa, Primal Dawn', 'hand', 1)!, controller: 1 }], 'effect'));
    tg.resolve();
    expect(tg.names(1, 'hand')).toEqual(['Elvish Mystic', 'Island']);
    // Elvish Mystic (1) não é a mais forte
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Elvish Mystic', 'hand', 1)!, controller: 1 }], 'effect'));
    tg.resolve();
    expect(tg.names(1, 'hand')).toEqual(['Island']);
  });
});
