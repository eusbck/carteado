import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Canopy Gargantuan', () => {
  it('na manutenção, cada outra criatura sua recebe marcadores iguais à resistência', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Canopy Gargantuan', 'Wall of Omens'], ['Elvish Mystic']], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([4, 8]);
    expect(tg.pt(tg.bf('Canopy Gargantuan'))).toEqual([7, 7]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
  it('resguardo {2}: sem pagar, a mágica do oponente é anulada', () => {
    const tg = setup({ active: 1, battlefield: [['Canopy Gargantuan'], ['Plains', 'Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Pagar {2}', false).choose('criatura alvo', ['Canopy Gargantuan']).cast('Swords to Plowshares').resolveAll();
    expect(tg.find('Canopy Gargantuan')).not.toBeNull();
  });
  it('resguardo {2}: pagando, a mágica resolve', () => {
    const tg = setup({ active: 1, battlefield: [['Canopy Gargantuan'], ['Plains', 'Plains', 'Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.yes('Pagar {2}', true).choose('criatura alvo', ['Canopy Gargantuan']).cast('Swords to Plowshares').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Canopy Gargantuan']);
  });
});
