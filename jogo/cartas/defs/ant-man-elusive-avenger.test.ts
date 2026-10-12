import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ant-Man, Elusive Avenger';

describe(N, () => {
  it('não pode ser bloqueado por criaturas com força maior; o dano de combate a um jogador vira fichas Treasure', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], ['Indomitable Ancients', 'Serra Angel']] });
    const ant = tg.bf(N);
    expect(canBlock(tg.g, tg.bf('Indomitable Ancients'), ant)).toBe(true);
    expect(canBlock(tg.g, tg.bf('Serra Angel'), ant)).toBe(false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(2);
  });
});