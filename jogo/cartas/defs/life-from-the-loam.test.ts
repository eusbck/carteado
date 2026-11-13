import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Life from the Loam";

describe(C, () => {
  it('devolve até três terrenos do cemitério', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []], graveyard: [['Island', 'Swamp'], []] });
    tg.choose('cartas de terreno', ['Island', 'Swamp']).cast(C).resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Swamp']);
  });
  it('dragar 3 substitui a compra', () => {
    const tg = setup({ graveyard: [[C], []], library: [['Opt', 'Opt', 'Opt', 'Opt'], ['Opt']], step: 'upkeep' });
    tg.yes('Dragar');
    tg.passTo('main1');
    expect(tg.names(0, 'hand')).toEqual([C]);
  });
});
