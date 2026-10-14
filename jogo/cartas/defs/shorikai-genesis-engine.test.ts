import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Shorikai, Genesis Engine';

describe(N, () => {
  it('{1}, {T}: compra duas, descarta uma e cria uma ficha Pilot', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [['Sol Ring', 'Forest'], []] });
    tg.choose('escarte', ['Forest']);
    tg.activate(N, 'Compre duas').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.all('Pilot')).toHaveLength(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
