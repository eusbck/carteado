import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mystic Forge';

describe(N, () => {
  it('conjura artefatos e mágicas incolores do topo do grimório; cartas coloridas e terrenos, não', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], library: [['Silver Myr', 'Elvish Mystic', 'Island'], ['Island']] });
    expect(tg.canCast('Silver Myr')).toBe(true);
    tg.cast('Silver Myr', `mystic-forge:${tg.bf(N)}`).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
    // agora o topo é uma criatura verde
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });

  it('{T}, pague 1 de vida: exila a carta do topo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Elvish Mystic', 'Island'], ['Island']] });
    const vida = tg.life(0);
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.life(0)).toBe(vida - 1);
  });
});