import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bast, Panther Goddess';

describe(N, () => {
  it('alcance, atropelar e indestrutível; só ataca controlando três ou mais criaturas', () => {
    const dois = setup({ battlefield: [[N, 'Silver Myr'], []] });
    const id = dois.bf(N);
    expect(dois.pt(id)).toEqual([4, 4]);
    for (const kw of ['reach', 'trample', 'indestructible']) expect(hasKw(dois.g, id, kw)).toBe(true);
    expect(attackCandidates(dois.g, 0).map((a) => a.obj)).not.toContain(id);
    const tres = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    expect(attackCandidates(tres.g, 0).map((a) => a.obj)).toContain(tres.bf(N));
  });

  it('quando você ataca, a criatura atacante alvo recebe +X/+X, X igual ao número de criaturas que você controla', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    tg.choose('criatura atacante alvo', ['Silver Myr']);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
  });
});