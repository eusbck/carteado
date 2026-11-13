import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Scapeshift';

describe(N, () => {
  it('sacrifica na resolução os terrenos escolhidos e busca outros tantos, que entram virados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Island'], []], hand: [[N], []], library: [['Hex', 'Strip Mine', 'Breeding Pool', 'Swamp'], []] });
    tg.choose('Scapeshift: sacrifique', ['Island', 'Island']);
    tg.choose('Scapeshift: procure', ['Strip Mine', 'Breeding Pool']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Island', N].sort());
    expect(tg.state.objects[tg.bf('Strip Mine')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Breeding Pool')].tapped).toBe(true);
    expect(tg.find('Swamp', 'library')).not.toBeNull();
  });
});
