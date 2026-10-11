import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates, blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vow of Malice';
const A = 'Indomitable Ancients';

describe(N, () => {
  it('a criatura encantada recebe +2/+2, tem a palavra-chave e não pode atacar quem controla a Aura', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[{ name: N, attachTo: A }], [A], []] });
    const a = tg.bf(A);
    expect(tg.pt(a)).toEqual([4, 12]);
    expect(hasKw(tg.g, a, 'intimidate')).toBe(true);
    const alvos = attackCandidates(tg.g, 1).find((x) => x.obj === a)!.targets;
    expect(alvos).toEqual([{ kind: 'player', id: 2 }]);
    void blockCandidates;
  });

  it('CR 702.13b: com intimidar, só é bloqueada por criaturas artefato ou que compartilhem uma cor com ela', () => {
    // Indomitable Ancients é branca: Silver Myr (artefato) e Serra Angel (branca) bloqueiam; Elvish Mystic (verde), não
    const tg = setup({ battlefield: [[{ name: N, attachTo: A }, A], ['Silver Myr', 'Serra Angel', 'Elvish Mystic']] });
    tg.attack([[A, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).map((b) => tg.state.objects[b.obj].def).sort()).toEqual(['Serra Angel', 'Silver Myr']);
  });});