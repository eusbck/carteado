import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Minion of the Mighty';
const Z = 'Zetalpa, Primal Dawn';
const A = 'Indomitable Ancients';

describe(N, () => {
  it('com força total 6 ou mais, põe um Dragon da mão virado e atacando, sem disparar "sempre que ataca"', () => {
    // força total: 0 (Minion) + 4 (Zetalpa) + 2 (Ancients) = 6
    const tg = setup({ battlefield: [[N, Z, A], []], hand: [['Goldspan Dragon'], []], library: [[], ['Island']] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    tg.choose(N, ['Goldspan Dragon']).attack([[N, 1], [Z, 1], [A, 1]]);
    tg.passTo('declareBlockers');
    const dragao = tg.bf('Goldspan Dragon');
    expect(tg.state.objects[dragao].tapped).toBe(true);
    expect(tg.state.combat?.attackers.some((a) => a.id === dragao)).toBe(true);
    // o "sempre que Goldspan Dragon ataca" não disparou: nenhuma ficha de Treasure
    expect(tg.all('Treasure')).toHaveLength(0);
    tg.passTo('main2');
    // Zetalpa tem golpe duplo: 0 + 8 + 2, mais 4 do Dragon que entrou atacando
    expect(tg.life(1)).toBe(40 - 0 - 8 - 2 - 4);
  });

  it('só uma carta de criatura Dragon da mão pode ser escolhida', () => {
    const tg = setup({ battlefield: [[N, Z, A], []], hand: [["Dragon's Hoard", 'Elvish Mystic', 'Rapacious Dragon'], []], library: [[], ['Island']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [] };
    });
    tg.attack([[N, 1], [Z, 1], [A, 1]]).passTo('declareBlockers');
    expect(opcoes).toEqual(['Rapacious Dragon']);
    // é opcional: sem escolher, nada entra
    expect(tg.find('Rapacious Dragon')).toBeNull();
  });

  it('com força total menor que 6, não dispara', () => {
    const tg = setup({ battlefield: [[N, Z], []], hand: [['Goldspan Dragon'], []], library: [[], ['Island']] });
    tg.attack([[N, 1], [Z, 1]]).passTo('declareBlockers');
    expect(tg.find('Goldspan Dragon')).toBeNull();
  });

  it('com mais de um oponente, você escolhe quem o Dragon ataca', () => {
    const tg = setup({ players: 3, battlefield: [[N, Z, A], [], []], hand: [['Goldspan Dragon'], [], []], library: [[], ['Island'], ['Island']] });
    tg.choose(N, ['Goldspan Dragon']).choose('entra atacando quem', ['Carla']).attack([[N, 1], [Z, 1], [A, 1]]);
    tg.passTo('main2');
    // Bruno leva 0 + 8 (golpe duplo) + 2; Carla leva os 4 do Dragon
    expect([tg.life(1), tg.life(2)]).toEqual([30, 36]);
  });
});
