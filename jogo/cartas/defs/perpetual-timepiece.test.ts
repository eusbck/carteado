import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Perpetual Timepiece', () => {
  it('{T}: moa duas cartas', () => {
    const tg = setup({ battlefield: [['Perpetual Timepiece'], []], library: [['Island', 'Plains', 'Swamp'], []] });
    tg.activate('Perpetual Timepiece', 'Moa').resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Plains']);
  });
  it('{2}, exile: embaralha as cartas alvo do cemitério no grimório', () => {
    const tg = setup({ battlefield: [['Perpetual Timepiece', 'Plains', 'Plains'], []], graveyard: [['Wall of Omens', 'Island', 'Sol Ring'], []], library: [['Swamp'], []] });
    tg.choose('cartas alvo do seu cemitério', ['Wall of Omens', 'Sol Ring']).activate('Perpetual Timepiece', 'Embaralhe').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'library').sort()).toEqual(['Sol Ring', 'Swamp', 'Wall of Omens']);
    expect(tg.names(0, 'exile')).toEqual(['Perpetual Timepiece']);
  });
  it('sem alvos, só embaralha', () => {
    const tg = setup({ battlefield: [['Perpetual Timepiece', 'Plains', 'Plains'], []], graveyard: [['Island'], []], library: [['Swamp', 'Plains'], []] });
    tg.choose('cartas alvo do seu cemitério', []);
    const antes = JSON.stringify(tg.state.rng);
    tg.activate('Perpetual Timepiece', 'Embaralhe').resolve();
    expect(JSON.stringify(tg.state.rng)).not.toBe(antes);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
});
