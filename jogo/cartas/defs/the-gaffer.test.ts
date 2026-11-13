import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Gaffer';

describe(N, () => {
  it('com 3 ou mais de vida ganha no turno, compra uma carta na etapa final, também no turno do oponente', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 3, null);
    tg.passTo('end', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);

    const op = setup({ active: 1, battlefield: [[N], []] });
    gainLife(op.g, 0, 4, null);
    op.passTo('end', 1);
    op.resolveAll();
    expect(op.names(0, 'hand')).toHaveLength(1);
  });

  it('com menos de 3 de vida ganha, não compra', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 2, null);
    tg.passTo('end', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});
