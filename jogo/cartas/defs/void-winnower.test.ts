import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Void Winnower';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('os oponentes não conjuram mágicas de valor par nem bloqueiam com criaturas de valor par', () => {
    // Silver Myr (2) e Indomitable Ancients (4) são pares; Elvish Mystic (1) e Sol Ring (1) são ímpares
    const tg = setup({ active: 1, battlefield: [[N], ['Forest', 'Forest', 'Island', 'Island']], hand: [['Silver Myr'], ['Silver Myr', 'Elvish Mystic', 'Sol Ring']], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([11, 9]);
    expect(tg.canCast('Silver Myr')).toBe(false);
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    expect(tg.canCast('Sol Ring')).toBe(true);
    // você continua podendo
    tg.passTo('main1', 0);
    const meu = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Silver Myr'], []], library: [lib, lib] });
    expect(meu.canCast('Silver Myr')).toBe(true);
  });

  it('criatura de valor par de um oponente não pode bloquear', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Silver Myr', 'Elvish Mystic']], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    const cands = blockCandidates(tg.g, 1).map((b) => tg.state.objects[b.obj].def);
    expect(cands).toEqual(['Elvish Mystic']);
  });
});
