import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Windgrace's Judgment";
const MANA = ['Swamp', 'Forest', 'Swamp', 'Forest', 'Swamp'];

describe(NOME, () => {
  it('destrói uma permanente não terreno de cada oponente escolhido', () => {
    const tg = setup({ players: 3, battlefield: [MANA, ['Sol Ring', 'Forest'], ['Wall of Omens']], hand: [[NOME], [], []] });
    tg.choose('para cada oponente', ['Sol Ring', 'Wall of Omens']).cast(NOME).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    expect(tg.names(2, 'graveyard')).toEqual(['Wall of Omens']);
  });

  it('não pode mirar duas permanentes do mesmo oponente', () => {
    const tg = setup({ battlefield: [MANA, ['Sol Ring', 'Wall of Omens']], hand: [[NOME], []] });
    expect(() => tg.choose('para cada oponente', ['Sol Ring', 'Wall of Omens']).cast(NOME)).toThrow();
  });
});
