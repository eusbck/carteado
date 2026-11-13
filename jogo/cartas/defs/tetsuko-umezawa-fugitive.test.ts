import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tetsuko Umezawa, Fugitive';

describe(N, () => {
  it('criaturas suas com força ou resistência 1 ou menos não podem ser bloqueadas', () => {
    // Tetsuko 1/3 (força 1), Memnite 1/1, Moonblade Shinobi 3/2 (pode ser bloqueado)
    const tg = setup({ battlefield: [[N, 'Memnite', 'Moonblade Shinobi'], ['Indomitable Ancients']] });
    const [t, o, s] = [tg.bf(N), tg.bf('Memnite'), tg.bf('Moonblade Shinobi')];
    tg.attack([[N, 1], ['Memnite', 1], ['Moonblade Shinobi', 1]]).passTo('declareBlockers');
    const podem = blockCandidates(tg.g, 1).flatMap((b) => b.canBlock);
    expect(podem).not.toContain(t);
    expect(podem).not.toContain(o);
    expect(podem).toContain(s);
  });
});
