import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Vengeful Ancestor';
const lib = Array(5).fill('Island');

describe(NOME, () => {
  it('ao entrar, goada a criatura alvo; quando ela ataca, causa 1 de dano ao próprio controlador', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients'], []], hand: [[NOME], [], []], library: [lib, lib, lib] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolveAll();
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
    tg.passTo('main1', 1);
    tg.attack([['Indomitable Ancients', 2]]).passTo('main2', 1);
    expect(tg.life(1)).toBe(39);
    expect(tg.life(2)).toBe(38);
  });

  it('ao atacar, goada a criatura alvo', () => {
    const tg = setup({ battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).attack([[NOME, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
  });
});
