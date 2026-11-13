import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ipnu Rivulet';

describe(N, () => {
  it('{T}: {C}; {T}, pague 1 de vida: {U}', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Opt'], []], library: [['Forest', 'Forest'], []] });
    tg.cast('Opt').resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });
  it('pode sacrificar a si mesma para pagar o custo: o jogador alvo mói quatro', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], library: [[], ['Forest', 'Forest', 'Forest', 'Forest', 'Swamp']] });
    tg.choose('jogador alvo', ['Bruno']).choose('Desert', [N]);
    tg.activate(N, 'mói').resolve();
    expect(tg.names(1, 'graveyard')).toHaveLength(4);
    expect(tg.names(1, 'library')).toEqual(['Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
