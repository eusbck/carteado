import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Riddlesmith';

describe(N, () => {
  it('conjurando um artefato, compra e descarta antes de a mágica resolver', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Sol Ring', 'Swamp'], []], library: [['Island'], []] });
    tg.yes('Riddlesmith', true).choose('escarte', ['Swamp']);
    tg.cast('Sol Ring').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp']);
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
