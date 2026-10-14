import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Talrand, Sky Summoner';

describe(N, () => {
  it('o gatilho resolve antes da mágica e a ficha fica mesmo com a mágica anulada', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Island', 'Island']], hand: [['Opt'], ['Counterspell']], library: [['Plains'], []] });
    tg.cast('Opt');
    // a mágica e o gatilho na pilha; o gatilho em cima
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'battlefield')).toContain('Drake');
    // o oponente anula o Opt: a ficha continua
    tg.pass();
    tg.choose('mágica alvo', ['Opt']).cast('Counterspell').resolveAll();
    expect(tg.find('Opt', 'graveyard', 0)).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.all('Drake')).toHaveLength(1);
  });

  it('mágica de criatura não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Island'], []], hand: [['Wall of Omens'], []] });
    tg.cast('Wall of Omens');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
