import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Madame Hydra';

describe(N, () => {
  it('cria um Villain 2/1 preto com ameaçar quando você conjura uma mágica de Villain', () => {
    const tg = setup({ battlefield: [[N, ...Array(6).fill('Swamp')], []], hand: [['The Frightful Four', 'Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    tg.cast('The Frightful Four').resolveAll();
    const [ficha] = tg.all('Villain');
    expect(tg.pt(ficha)).toEqual([2, 1]);
    expect(hasKw(tg.g, ficha, 'menace')).toBe(true);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.all('Villain')).toHaveLength(1);
  });
});
