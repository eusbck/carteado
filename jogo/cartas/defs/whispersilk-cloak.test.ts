import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Whispersilk Cloak';

describe(N, () => {
  it('a criatura equipada não pode ser bloqueada e tem manto; equipar {2}', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Silver Myr'], ['Indomitable Ancients']] });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).activate(N).resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(myr);
    expect(hasKw(tg.g, myr, 'shroud')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1)).toEqual([]);
  });
});