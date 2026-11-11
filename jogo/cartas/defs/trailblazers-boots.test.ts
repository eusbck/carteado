import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Trailblazer's Boots";

describe(N, () => {
  it('CR 702.14c: a criatura equipada não pode ser bloqueada se o jogador defensor controla um terreno não básico', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Silver Myr' }, 'Silver Myr', 'Elvish Mystic'], ['Indomitable Ancients', 'Command Tower', 'Forest']] });
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'nonbasic landwalk')).toBe(true);
    tg.attack([['Silver Myr', 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    const podem = blockCandidates(tg.g, 1).flatMap((b) => b.canBlock);
    expect(podem).not.toContain(tg.bf('Silver Myr'));
    // a criatura sem as botas continua bloqueável
    expect(podem).toContain(tg.bf('Elvish Mystic'));
  });

  it('CR 702.14c: só terrenos básicos do defensor não impedem o bloqueio', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Silver Myr' }, 'Silver Myr', 'Command Tower'], ['Indomitable Ancients', 'Forest']] });
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(tg.bf('Silver Myr')))).toBe(true);
  });
});
