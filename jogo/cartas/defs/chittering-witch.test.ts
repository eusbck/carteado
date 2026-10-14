import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Chittering Witch';

describe(NOME, () => {
  it('cria uma Rat por oponente que ainda está na partida', () => {
    const tg = setup({ players: 4, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], [], [], []], hand: [[NOME], [], [], []] });
    tg.state.players[3].left = true;
    tg.cast(NOME).resolveAll();
    expect(tg.all('Rat').length).toBe(2);
  });

  it('pode sacrificar a própria Witch para pagar o custo', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp'], ['Wall of Omens']] });
    tg.choose('Sacrifique', [NOME]).choose('criatura alvo', ['Wall of Omens']).activate(NOME, '-2/-2').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
  });
});
