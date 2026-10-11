import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Corsairs of Umbar';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('{2}{U}: o Pirate alvo não pode ser bloqueado; causando dano de combate a um jogador, reúne Orcs 3', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], ['Indomitable Ancients']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    tg.choose('Goblin, Orc ou Pirate alvo', [N]).activate(N, '{2}{U}').resolveAll();
    expect(tg.state.effects.some((e) => e.affected?.includes(id) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBeBlocked'))).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    // o Ancients não pode bloqueá-lo
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
  });

  it('sem bloqueio, o dano passa e você reúne Orcs 3', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([3, 3]);
  });
});
