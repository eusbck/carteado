import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Losheel, Clockwork Scholar';

describe(C, () => {
  it('compra uma vez por turno quando criaturas-artefato entram', () => {
    const tg = setup({ battlefield: [[C, ...Array(3).fill('Plains')], []], hand: [['Ornithopter', 'Memnite'], []], library: [['Opt', 'Opt', 'Opt'], []] });
    tg.cast('Ornithopter').resolve().resolveAll();
    tg.cast('Memnite').resolve().resolveAll();
    expect(tg.names(0, 'hand').filter((n) => n === 'Opt').length).toBe(1);
  });
});
