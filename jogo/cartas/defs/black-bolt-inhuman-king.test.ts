import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Black Bolt, Inhuman King';

describe(N, () => {
  it('voar; recebe +2/+2 quando você conjura uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Forest'], []], hand: [['Sol Ring', 'Elvish Mystic'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.pt(id)).toEqual([5, 5]);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.pt(id)).toEqual([5, 5]);
  });

  it('Voz Letal: mirado por um oponente, destrói um permanente não terreno desse jogador antes de a mágica resolver', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Plains', 'Plains', 'Sol Ring']], hand: [[], ['Bovine Intervention']] });
    tg.choose('artefato ou criatura alvo', [N]).choose('permanente não terreno alvo', ['Sol Ring']).cast('Bovine Intervention');
    tg.resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find(N)).not.toBeNull();
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
  });

  it('mirado por você mesmo, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], ['Sol Ring']], hand: [['Bovine Intervention'], []] });
    tg.choose('artefato ou criatura alvo', [N]).cast('Bovine Intervention');
    // na pilha ficam a mágica e o gatilho de +2/+2; a Voz Letal não dispara
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
