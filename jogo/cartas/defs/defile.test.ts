import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Defile';

describe(N, () => {
  it('a criatura alvo recebe -1/-1 para cada Swamp que você controla', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Island'], ['Serra Angel']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Serra Angel']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([1, 1]);
  });
});