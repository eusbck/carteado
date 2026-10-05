import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Conspiracy Theorist', () => {
  it('a carta exilada é conjurada pagando o custo, neste turno', () => {
    const tg = setup({ battlefield: [['Conspiracy Theorist', ...Array(6).fill('Mountain')], ['Sol Ring']], hand: [['Big Score', 'Abrade'], []], library: [['Island', 'Island'], []] });
    tg.choose('escarte', ['Abrade']).choose('Conspiracy Theorist', ['Abrade']);
    tg.cast('Big Score').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Abrade']);
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']);
    tg.cast('Abrade', '*').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
  it('ao atacar, pode pagar {1} e descartar para comprar', () => {
    const tg = setup({ battlefield: [['Conspiracy Theorist', 'Mountain'], []], hand: [['Forest'], []], library: [['Island'], []] });
    tg.yes('Pagar {1}', true);
    tg.attack([['Conspiracy Theorist', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});
