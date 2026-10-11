import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Puppet Master, String Puller';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('ao atacar, goada a criatura alvo de um oponente, que não pode bloquear neste turno', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients'], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    const anciao = tg.bf('Indomitable Ancients');
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[anciao].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.effects.some((e) => e.affected?.includes(anciao) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBlock'))).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
  });

  it('criatura goadada causando dano de combate a um oponente seu: você cria um Treasure', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients'], []], library: [lib, lib, lib] });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(0);
    // no turno do Bruno, o Ancients goadado ataca a Carla (não pode atacar você se puder atacar outro)
    tg.script.length = 0;
    tg.attack([['Indomitable Ancients', 2]]);
    tg.passTo('main2', 1);
    expect(tg.life(2)).toBe(38);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.state.objects[tg.all('Treasure')[0]].controller).toBe(0);
  });
});
