import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates, requiredTargets } from '../../motor/combat.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Silver Surfer, Galactus's Herald";
const G = 'Galactus, Devourer of Worlds';
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('voar; ao entrar, pode buscar Galactus no grimório', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []], library: [[...lib, G], lib] });
    tg.yes('Silver Surfer', true).choose('Galactus', [G]);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toContain(G);
  });

  it('causando dano de combate a um jogador, a criatura alvo precisa atacar esse jogador até o fim do seu próximo turno', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic'], [], []], library: [lib, lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('criatura alvo', ['Elvish Mystic']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
    tg.passTo('main1', 1);
    tg.passTo('main1', 2);
    tg.passTo('main1', 0);
    const alvos = attackCandidates(tg.g, 0).find((c) => c.obj === elfo)?.targets ?? [];
    expect(requiredTargets(tg.g, elfo, alvos).map((t) => t.id)).toEqual([1]);
    // depois do seu próximo turno, acabou
    tg.passTo('main1', 1);
    expect(tg.state.effects.some((e) => e.affected?.includes(elfo) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:attacksIfAble'))).toBe(false);
  });
});
