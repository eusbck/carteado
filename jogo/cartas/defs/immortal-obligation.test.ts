import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { attackCandidates, canBlock } from '../../motor/combat.ts';
import { goadada } from '../culpa.ts';

const NOME = 'Immortal Obligation';
const lib = Array(6).fill('Island');

describe(NOME, () => {
  it('devolve a criatura ao campo do dono com um marcador de dever: goadada, não ataca você e não bloqueia as suas', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Indomitable Ancients'], [], []], hand: [[NOME], [], []], graveyard: [[], ['Zetalpa, Primal Dawn'], []], library: [lib, lib, lib] });
    tg.choose('carta de criatura alvo', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    const z = tg.find('Zetalpa, Primal Dawn', 'battlefield', 1)!;
    expect(z).not.toBeNull();
    expect(tg.state.objects[z].counters.duty).toBe(1);
    expect(goadada(tg.g, z)).toBe(true);
    // não bloqueia as suas criaturas
    expect(canBlock(tg.g, z, tg.bf('Indomitable Ancients'))).toBe(false);
    // no turno de Bruno, só pode atacar Carla
    tg.passTo('main1', 1);
    const alvos = attackCandidates(tg.g, 1).find((x) => x.obj === z)!.targets.map((t) => t.id);
    expect(alvos).toEqual([2]);
  });
});
