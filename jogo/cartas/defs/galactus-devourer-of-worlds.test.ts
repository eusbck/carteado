import { describe, expect, it } from 'vitest';
import { loseLife } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates, requiredTargets, validateAttack } from '../../motor/combat.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Galactus, Devourer of Worlds';
const exigidos = (tg: ReturnType<typeof setup>) => {
  const id = tg.bf(N);
  const alvos = attackCandidates(tg.g, 0).find((c) => c.obj === id)?.targets ?? [];
  return requiredTargets(tg.g, id, alvos).map((t) => t.id);
};

describe(N, () => {
  it('12/12 com voar, atropelar e indestrutível; ao entrar, exila o permanente alvo', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Sol Ring']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([12, 12]);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'trample') && hasKw(tg.g, id, 'indestructible')).toBe(true);
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
  });

  it('precisa atacar um oponente com a maior vida; com Silver Surfer no campo, a exigência some', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []] });
    // empate: qualquer um dos dois serve
    expect(exigidos(tg).sort()).toEqual([1, 2]);
    loseLife(tg.g, 1, 5, null);
    tg.refresh();
    expect(exigidos(tg)).toEqual([2]);
    expect(validateAttack(tg.g, 0, [[tg.bf(N), { kind: 'player', id: 1 }]])).not.toBeNull();
    expect(validateAttack(tg.g, 0, [[tg.bf(N), { kind: 'player', id: 2 }]])).toBeNull();
    const com = setup({ players: 3, battlefield: [[N, "Silver Surfer, Galactus's Herald"], [], []] });
    loseLife(com.g, 1, 5, null);
    com.refresh();
    expect(exigidos(com)).toEqual([]);
  });
});
