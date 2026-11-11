import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Silver Shroud Costume';

describe(N, () => {
  it('lampejo: ao entrar, anexa-se à criatura alvo, que ganha manto até o fim do turno e não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Silver Myr'], ['Indomitable Ancients']], hand: [[N], []], step: 'beginCombat' });
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N).resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(myr);
    expect(hasKw(tg.g, myr, 'shroud')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1)).toEqual([]);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, myr, 'shroud')).toBe(false);
  });

  it('anexado a uma criatura já bloqueada, ela continua bloqueada (CR 509.1h)', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Silver Myr'], ['Indomitable Ancients']], hand: [[N], []], step: 'beginCombat' });
    tg.attack([['Silver Myr', 1]]).block([['Indomitable Ancients', 'Silver Myr']]).passTo('declareBlockers');
    tg.choose('criatura alvo que você controla', ['Silver Myr']).cast(N).resolveAll();
    const at = tg.state.combat!.attackers.find((a) => a.id === tg.bf('Silver Myr'))!;
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(at.id);
    expect(at.blocked).toBe(true);
  });
});
