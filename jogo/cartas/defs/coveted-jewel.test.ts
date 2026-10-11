import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Coveted Jewel';
const ilhas = Array(10).fill('Island');

describe(N, () => {
  it('entrando, compra três cartas; {T}: três manas de uma mesma cor', () => {
    const tg = setup({ battlefield: [Array(6).fill('Island'), []], hand: [[N], []], library: [ilhas, ilhas] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    activateMana(tg, N, 'R');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R', 'R', 'R']);
  });

  it('a atacante não bloqueada dá ao oponente três cartas e o controle da Jewel, desvirada, antes do dano', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, tapped: true }], ['Silver Myr']], library: [ilhas, ilhas] });
    const joia = tg.bf(N);
    tg.attack([['Silver Myr', 0]]).passTo('combatDamage');
    expect(controllerOf(tg.g, joia)).toBe(1);
    expect(tg.state.objects[joia].tapped).toBe(false);
    expect(tg.names(1, 'hand')).toHaveLength(3);
  });

  it('com todas as atacantes bloqueadas, nada acontece', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Indomitable Ancients'], ['Silver Myr']], library: [ilhas, ilhas] });
    tg.attack([['Silver Myr', 0]]).block([['Indomitable Ancients', 'Silver Myr']]).passTo('main2', 1);
    expect(controllerOf(tg.g, tg.bf(N))).toBe(0);
  });
});