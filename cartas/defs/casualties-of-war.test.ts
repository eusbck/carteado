import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Casualties of War', () => {
  it('escolhe vários modos, cada um uma vez', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Forest', 'Forest', 'Sol Ring'], ['Arcane Signet', 'Wall of Omens', 'Command Tower', { name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]],
      hand: [['Casualties of War'], []],
    });
    tg.choose('modo', ['Destrua o artefato alvo', 'Destrua a criatura alvo', 'Destrua o terreno alvo', 'Destrua o planeswalker alvo']);
    tg.choose('artefato alvo', ['Arcane Signet']).choose('criatura alvo', ['Wall of Omens']).choose('terreno alvo', ['Command Tower']).choose('planeswalker alvo', ['Quintorius, History Chaser']);
    tg.cast('Casualties of War').resolve();
    expect(tg.names(1, 'battlefield')).toEqual([]);
  });
});
