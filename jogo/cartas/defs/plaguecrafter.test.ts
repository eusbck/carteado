import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Plaguecrafter';

describe(NOME, () => {
  it('cada jogador sacrifica uma criatura ou planeswalker; quem não tem descarta uma carta', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ["Elspeth, Sun's Champion"], []], hand: [[NOME], [], ['Island']] });
    tg.choose('Plaguecrafter: sacrifique', ['Wall of Omens']);
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(1, 'graveyard')).toEqual(["Elspeth, Sun's Champion"]);
    expect(tg.names(2, 'graveyard')).toEqual(['Island']);
    expect(tg.find(NOME)).not.toBeNull();
  });

  it('Ana, sem outra criatura, sacrifica o próprio Plaguecrafter', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
