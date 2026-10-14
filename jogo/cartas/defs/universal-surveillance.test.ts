import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Universal Surveillance';

describe(N, () => {
  it('improvisar: os artefatos pagam o X; compra X cartas', () => {
    const tg = fixture({ battlefield: [['Island', 'Island', 'Island', "Cultivator's Caravan", 'Peacewalker Colossus'], []], hand: [[N], []] });
    tg.number('valor de X', 2);
    tg.cast(N).resolve();
    expect(tg.state.zones.hand[0]).toHaveLength(2);
    expect(tg.state.objects[tg.bf('Peacewalker Colossus')].tapped).toBe(true);
  });
});
