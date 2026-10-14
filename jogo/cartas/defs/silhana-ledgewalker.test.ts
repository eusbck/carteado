import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Silhana Ledgewalker';

describe(N, () => {
  it('uma criatura com alcance não a bloqueia; uma com voar bloqueia', () => {
    // Tower Winder tem alcance; Baleful Strix tem voar
    const tg = setup({ battlefield: [[N], ['Tower Winder', 'Baleful Strix', 'Indomitable Ancients']] });
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const podem = blockCandidates(tg.g, 1).filter((b) => b.canBlock.includes(tg.bf(N))).map((b) => tg.state.objects[b.obj].def);
    expect(podem).toEqual(['Baleful Strix']);
  });
});
