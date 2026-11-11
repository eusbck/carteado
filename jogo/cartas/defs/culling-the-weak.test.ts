import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Culling the Weak';

describe(NOME, () => {
  it('a criatura já foi sacrificada quando a mágica está na pilha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Wall of Omens', 'Indomitable Ancients'], []], hand: [[NOME], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    tg.resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B', 'B']);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Wall of Omens']], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
