import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const B = 'Bonehoard Dracosaur';

describe(B, () => {
  it('dois terrenos dão um Dinosaur só; um terreno e outra carta dão um de cada', () => {
    const tg = setup({ battlefield: [[B], []], library: [['Island', 'Plains', 'Swamp'], ['Island', 'Island']], active: 1 });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    tg.resolve();
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', 'Plains']);
    expect(tg.names(0, 'battlefield').sort()).toEqual([B, 'Dinosaur']);
    const tg2 = setup({ battlefield: [[B], []], library: [['Island', 'Sol Ring', 'Swamp'], ['Island', 'Island']], active: 1 });
    tg2.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    tg2.resolve();
    expect(tg2.names(0, 'battlefield').sort()).toEqual([B, 'Dinosaur', 'Treasure']);
  });

  it('pode jogar as cartas exiladas neste turno, pagando os custos', () => {
    const tg = setup({ battlefield: [[B, 'Mountain'], []], library: [['Island', 'Sol Ring', 'Swamp'], ['Island', 'Island']], active: 1 });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    tg.resolve();
    tg.passTo('main1', 0);
    const ilha = tg.find('Island', 'exile', 0)!;
    const sol = tg.find('Sol Ring', 'exile', 0)!;
    expect(tg.actionIds().some((a) => a.includes(String(ilha)) && a.startsWith('play:'))).toBe(true);
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${sol}:`))).toBe(true);
  });
});
