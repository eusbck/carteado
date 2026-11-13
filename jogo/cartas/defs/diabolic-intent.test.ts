import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Diabolic Intent';

describe(NOME, () => {
  it('sacrifica a criatura ao conjurar e põe a carta procurada na mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Wall of Omens'], []], hand: [[NOME], []], library: [['Forest', 'Sol Ring', 'Island'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).choose('Procure', ['Sol Ring']);
    tg.cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
