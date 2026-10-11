import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Bloodtithe Harvester';

describe(N, () => {
  it('X é o dobro das fichas de Blood que você controla na resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    expect(tg.all('Blood')).toHaveLength(1);
    // já no campo e sem Blood: X é 0 e nada muda
    const lib = Array(8).fill('Swamp');
    const pronto = setup({ battlefield: [[N], ['Indomitable Ancients', 'Elvish Mystic']], library: [lib, lib] });
    pronto.choose('criatura alvo', ['Elvish Mystic']);
    pronto.activate(N, '{T}, Sacrifique').resolveAll();
    expect(pronto.find(N)).toBeNull();
    expect(pronto.find('Elvish Mystic')).not.toBeNull();
  });

  it('com um Blood, a criatura alvo recebe -2/-2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Mountain'], ['Silver Myr', 'Indomitable Ancients']], hand: [[N], []], library: [Array(8).fill('Swamp'), Array(8).fill('Swamp')] });
    tg.cast(N).resolveAll();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.activate(N, '{T}, Sacrifique').resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
  });
});
