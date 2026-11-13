import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stonespeaker Crystal';

describe(N, () => {
  it('exila os cemitérios dos jogadores escolhidos como alvo e compra uma carta', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Plains', 'Plains'], [], []], graveyard: [['Sol Ring'], ['Wall of Omens'], ['Island']] });
    tg.choose('jogadores alvo', [tg.state.players[1].name]);
    const mao = tg.state.zones.hand[0].length;
    tg.activate(N, 'Exile').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(2, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring', N]);
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });

  it('sem nenhum alvo, só compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], graveyard: [[], ['Wall of Omens']] });
    tg.choose('jogadores alvo', []);
    const mao = tg.state.zones.hand[0].length;
    tg.activate(N, 'Exile').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });
});
