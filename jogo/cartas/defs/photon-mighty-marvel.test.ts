import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Photon, Mighty Marvel';

describe(N, () => {
  it('voar; causando dano de combate a um jogador, adiciona essa quantidade de mana de uma cor, que dura até o fim do turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.choose('Photon', ['Vermelho']).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R', 'R']);
    tg.passTo('end', 0);
    expect(tg.state.players[0].manaPool).toHaveLength(2);
    tg.passTo('upkeep', 1);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
  });
});