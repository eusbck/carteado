import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Faerie Mastermind', () => {
  it('dispara mesmo que a Mastermind tenha entrado depois da primeira compra', () => {
    const tg = setup({ battlefield: [['Faerie Mastermind', 'Island', 'Island', 'Island', 'Island'], []], library: [['Plains', 'Plains', 'Plains'], ['Swamp', 'Swamp']] });
    tg.state.turnStats[1].cardsDrawn = 1; // Bruno já comprou uma neste turno
    tg.activate('Faerie Mastermind', 'Cada jogador').resolve();
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.names(1, 'hand').length).toBe(1);
  });
});
