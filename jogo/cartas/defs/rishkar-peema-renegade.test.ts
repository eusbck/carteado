import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Rishkar, Peema Renegade';

describe(N, () => {
  it('põe um marcador +1/+1 em até duas criaturas, Rishkar incluído, e elas ganham {T}: Adicione {G}', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Wall of Omens', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.choose('até duas criaturas alvo', [N, 'Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    const fontes = manaOptions(tg.g, 0).map((o) => o.obj);
    expect(fontes).toContain(tg.bf('Indomitable Ancients'));
    expect(fontes).not.toContain(tg.bf('Wall of Omens'));
  });

  it('qualquer marcador vale, não só +1/+1', () => {
    const tg = setup({ battlefield: [[N, { name: 'Wall of Omens', counters: { stun: 1 } }], []] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf('Wall of Omens'))).toBe(true);
  });
});
