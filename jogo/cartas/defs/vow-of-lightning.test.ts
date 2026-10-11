import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates, blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vow of Lightning';
const A = 'Indomitable Ancients';

describe(N, () => {
  it('a criatura encantada recebe +2/+2, tem a palavra-chave e não pode atacar quem controla a Aura', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[{ name: N, attachTo: A }], [A], []] });
    const a = tg.bf(A);
    expect(tg.pt(a)).toEqual([4, 12]);
    expect(hasKw(tg.g, a, 'first strike')).toBe(true);
    const alvos = attackCandidates(tg.g, 1).find((x) => x.obj === a)!.targets;
    expect(alvos).toEqual([{ kind: 'player', id: 2 }]);
    void blockCandidates;
  });
});