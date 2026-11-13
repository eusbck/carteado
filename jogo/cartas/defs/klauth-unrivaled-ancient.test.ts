import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const K = 'Klauth, Unrivaled Ancient';

describe(K, () => {
  it('dispara no ataque, pela pilha; X é a força total das atacantes', () => {
    const tg = setup({ battlefield: [[K, 'Indomitable Ancients'], []], hand: [['Sol Ring'], []], library: [['Island'], ['Island']] });
    // 4 (Klauth) + 2 (Ancients) = 6: duas vermelhas e quatro verdes
    tg.number('quantas manas brancas', 0).number('quantas manas azuis', 0).number('quantas manas pretas', 0).number('quantas manas vermelhas', 2);
    tg.attack([[K, 1], ['Indomitable Ancients', 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    tg.resolve();
    const pool = () => tg.state.players[0].manaPool.map((u) => u.type).sort();
    expect(pool()).toEqual(['G', 'G', 'G', 'G', 'R', 'R']);
    // fica até o fim do turno, passando de etapa
    tg.passTo('main2');
    expect(pool().length).toBe(6);
    // só paga mágicas
    tg.cast('Sol Ring').resolve();
    expect(pool().length).toBe(5);
  });
});
