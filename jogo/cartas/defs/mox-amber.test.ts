import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mox Amber';

describe(N, () => {
  it('gera uma mana de uma das cores das suas criaturas lendárias; sem lendárias coloridas, nenhuma', () => {
    const tg = setup({ battlefield: [[N, 'Jin Sakai, Ghost of Tsushima', 'Serra Angel'], ['Skithiryx, the Blight Dragon']] });
    // Jin Sakai é branco, azul e preto
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N))).toHaveLength(3);
    const sem = setup({ battlefield: [[N, 'Serra Angel', 'Sol Ring'], []] });
    expect(manaOptions(sem.g, 0).filter((o) => o.obj === sem.bf(N))).toHaveLength(0);
  });
});