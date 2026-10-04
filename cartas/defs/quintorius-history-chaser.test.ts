import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Quintorius, History Chaser', () => {
  it('cartas saindo do cemitério ao mesmo tempo disparam uma vez só', () => {
    const tg = setup({ battlefield: [['Quintorius, History Chaser', 'Swamp'], []], graveyard: [['Indomitable Ancients', 'Wall of Omens'], []], hand: [['Reanimate'], []] });
    tg.choose('carta de criatura', ['Indomitable Ancients']).cast('Reanimate').resolve();
    tg.resolveAll();
    expect(tg.all('Spirit').length).toBe(1);
  });
  it('+1: descarta uma carta, compra duas e mói uma', () => {
    const tg = setup({ battlefield: [['Quintorius, History Chaser'], []], hand: [['Plains'], []], library: [['Island', 'Forest', 'Swamp'], []] });
    tg.yes('Descartar', true).activate('Quintorius, History Chaser', '+1').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty).toBe(6);
  });
  it('−4: Espíritos ganham golpe duplo e vigilância até o fim do turno', () => {
    const tg = setup({ battlefield: [['Quintorius, History Chaser', 'Wall of Omens'], []] });
    tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty = 5;
    tg.run(createTokensFor(tg));
    tg.activate('Quintorius, History Chaser', '−4').resolve();
    const spirit = tg.bf('Spirit');
    expect(hasKw(tg.g, spirit, 'double strike')).toBe(true);
    expect(hasKw(tg.g, spirit, 'vigilance')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(false);
  });
});

import { createTokens } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';
function createTokensFor(tg: TestGame) { return createTokens(tg.g, 0, 'Spirit 3/2', 1); }
