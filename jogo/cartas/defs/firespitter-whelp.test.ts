import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Firespitter Whelp';

describe(N, () => {
  it('o gatilho resolve antes da mágica que o disparou, mesmo que ela seja anulada', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Mountain'], [], []], hand: [['Sol Ring'], [], []] });
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // 1 de dano a cada oponente, com a mágica ainda na pilha
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.find('Sol Ring')).toBeNull();
    // anulada depois de disparar: o dano do gatilho já aconteceu
    counter(tg.g, tg.state.zones.stack[0]);
    tg.refresh().settle();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.life(1)).toBe(39);
  });

  it('mágica de Dragon dispara; mágica de criatura que não é Dragon não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Forest'], []], hand: [['Rapacious Dragon', 'Elvish Mystic'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.life(1)).toBe(40);
    tg.cast('Rapacious Dragon').resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
