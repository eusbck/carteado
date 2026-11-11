import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sam Kirk, Xenoanthropologist';

describe(N, () => {
  it('investiga quando um oponente conjura uma mágica de criatura; a sua e as que não são de criatura não contam', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], ['Forest', 'Forest']], hand: [['Elvish Mystic'], ['Elvish Mystic', 'Sol Ring']], active: 1 });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.find('Clue')).not.toBeNull();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Clue').length).toBe(1);
  });
});
