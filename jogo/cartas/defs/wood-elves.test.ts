import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wood Elves', () => {
  it('a Floresta entra desvirada; dá para não achar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Wood Elves'], []], library: [['Island', 'Forest'], []] });
    tg.choose('Floresta', ['Forest']).cast('Wood Elves').resolve();
    tg.resolveAll();
    const novas = tg.all('Forest').filter((id) => !tg.state.objects[id].tapped);
    expect(novas.length).toBe(1);
    expect(tg.names(0, 'library')).toEqual(['Island']);
    const nada = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Wood Elves'], []], library: [['Island', 'Forest'], []] });
    nada.choose('Floresta', []).cast('Wood Elves').resolve();
    nada.resolveAll();
    expect(nada.names(0, 'library').sort()).toEqual(['Forest', 'Island']);
  });
});
