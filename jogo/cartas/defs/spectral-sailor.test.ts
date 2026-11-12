import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

const N = 'Spectral Sailor';

describe(N, () => {
  it('tem lampejo e voar', () => expect(temPalavrasChave(N, 'flash', 'flying')).toBe(true));
  it('{3}{U}: compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island'], []], library: [['Forest'], []] });
    tg.activate(N, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
