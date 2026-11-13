import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Sacrifice';

describe(NOME, () => {
  it('sacrifica ao conjurar e adiciona {B} igual ao valor de mana da criatura', () => {
    // Wall of Omens custa {1}{W}: valor 2
    const tg = setup({ battlefield: [['Swamp', 'Wall of Omens'], []], hand: [[NOME], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    tg.resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B']);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
