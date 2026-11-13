import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Corrupted Conviction';

describe(NOME, () => {
  it('a criatura já foi sacrificada quando a mágica está na pilha, e compra duas cartas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Wall of Omens'], []], hand: [[NOME], []], library: [['Forest', 'Island', 'Plains'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Island']);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Wall of Omens']], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
