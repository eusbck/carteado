import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lotus Cobra';

describe(N, () => {
  it('jogando um terreno, o gatilho vai para a pilha e dá uma mana da cor escolhida', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.choose('Lotus Cobra', ['vermelho']).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R']);
  });
});
