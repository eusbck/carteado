import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const T = 'Twinflame Tyrant';

describe(T, () => {
  it('o dano dobrado é causado pela fonte original', () => {
    const tg = setup({ battlefield: [[T, 'Sol Ring', 'Indomitable Ancients'], ['Dragon Whelp']] });
    const fonte = tg.bf('Sol Ring');
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'player', id: 1 }, amount: 3, combat: false }]);
    expect(tg.life(1)).toBe(34);
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'obj', id: tg.bf('Dragon Whelp') }, amount: 1, combat: false }]);
    expect(tg.state.objects[tg.bf('Dragon Whelp')].damage).toBe(2);
    // a você e às suas criaturas, não dobra; a fonte do oponente não dobra
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
    dealDamage(tg.g, [{ source: tg.bf('Dragon Whelp'), target: { kind: 'player', id: 0 }, amount: 2, combat: false }]);
    expect(tg.life(0)).toBe(35);
  });
  it('em combate, dobra o dano atribuído a cada um', () => {
    const tg = setup({ battlefield: [[T], []], library: [['Island'], ['Island']] });
    tg.attack([[T, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(34);
  });
});
