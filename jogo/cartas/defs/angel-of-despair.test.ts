import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Angel of Despair';

describe(N, () => {
  it('voar; quando entra, destrói a permanente alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Swamp', 'Swamp', 'Swamp'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Sol Ring']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.find('Sol Ring')).toBeNull();
  });
});