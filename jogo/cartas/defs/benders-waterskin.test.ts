import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Bender's Waterskin";

describe(N, () => {
  it('desvira na etapa de desvirar de cada outro jogador', () => {
    const tg = setup({ players: 3, battlefield: [[{ name: N, tapped: true }], [], []], library: [['Opt'], ['Forest', 'Forest'], ['Forest', 'Forest']] });
    tg.passTo('upkeep', 1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });
  it('{T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Opt'], []], library: [['Ponder', 'Forest'], []] });
    tg.cast('Opt').resolve();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });
});
