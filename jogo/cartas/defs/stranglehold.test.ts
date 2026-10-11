import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stranglehold';
const pantanos = ['Swamp', 'Swamp', 'Swamp', 'Swamp'];

describe(N, () => {
  it('o oponente não encontra nada ao procurar, mas embaralha o grimório', () => {
    const tg = setup({ active: 1, battlefield: [[N], pantanos], hand: [[], ['Diabolic Tutor']], library: [[], ['Sol Ring', 'Island', 'Forest']] });
    tg.cast('Diabolic Tutor').resolveAll();
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.names(1, 'library')).toHaveLength(3);
  });

  it('você continua podendo procurar', () => {
    const tg = setup({ battlefield: [[N, ...pantanos], []], hand: [['Diabolic Tutor'], []], library: [['Sol Ring', 'Island', 'Forest'], []] });
    tg.choose('Procure uma carta', ['Sol Ring']).cast('Diabolic Tutor').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
});