import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Diabolic Tutor';

describe(N, () => {
  it('busca qualquer carta do grimório para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [['Island', 'Sol Ring', 'Forest'], []] });
    tg.choose('Procure uma carta', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });
});