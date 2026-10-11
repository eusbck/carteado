import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Talrand's Invocation";

describe(N, () => {
  it('cria duas fichas de criatura Drake 2/2 azuis com voar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const drakes = tg.all('Drake');
    expect(drakes).toHaveLength(2);
    for (const id of drakes) {
      expect(tg.pt(id)).toEqual([2, 2]);
      expect(chars(tg.g, id).colors).toEqual(['U']);
      expect(hasKw(tg.g, id, 'flying')).toBe(true);
    }
  });
});
