import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Deadly Dispute';

describe(NOME, () => {
  it('custo adicional: sacrifica um artefato ou criatura; compra duas e cria um Treasure', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', { name: 'Food', token: true }], []], hand: [[NOME], []], library: [['Island', 'Island'], []] });
    tg.choose('Sacrifique', ['Food']).cast(NOME);
    expect(tg.all('Food')).toEqual([]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    expect(tg.all('Treasure').length).toBe(1);
  });

  it('sem artefato nem criatura, não dá para conjurar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
