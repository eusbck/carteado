import { describe, expect, it } from 'vitest';
import { winGame } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Herald of Eternal Dawn';

describe(N, () => {
  it('com 0 de vida você não perde, e um efeito que faria o oponente vencer não faz nada', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.state.players[0].life = 0;
    tg.refresh();
    tg.passTo('main2', 0);
    expect(tg.state.players[0].lost).toBe(false);
    winGame(tg.g, 1, 'teste');
    expect(tg.state.gameOver).toBeNull();
    // o seu próprio "vencer" continua valendo
    winGame(tg.g, 0, 'teste');
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('conceder ainda tira você da partida', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.game.concede(0);
    expect(tg.state.players[0].left).toBe(true);
    // 104.2a: com todos os oponentes fora, Bruno vence mesmo assim
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });
});
