import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Rite of Flame';

describe(NOME, () => {
  it('adiciona {R}{R} e mais {R} para cada Rite of Flame em cada cemitério', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[NOME], []], graveyard: [[NOME], [NOME, 'Island']] });
    tg.cast(NOME).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R', 'R', 'R', 'R']);
  });
});
