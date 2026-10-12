import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mox Opal';

describe(N, () => {
  it('só gera mana com três ou mais artefatos sob o seu controle', () => {
    const com = setup({ battlefield: [[N, 'Sol Ring', 'Lotus Petal'], []] });
    expect(manaOptions(com.g, 0).filter((o) => o.obj === com.bf(N))).toHaveLength(5);
    const sem = setup({ battlefield: [[N, 'Sol Ring'], []] });
    expect(manaOptions(sem.g, 0).filter((o) => o.obj === sem.bf(N))).toHaveLength(0);
  });
});