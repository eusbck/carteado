import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { sacrifice } from '../../motor/api.ts';

describe('Scuzzback Scrounger', () => {
  it('blight 1 numa criatura sua cria um Tesouro', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Scuzzback Scrounger', 'Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.yes('blight').choose('marcador', ['Wall of Omens']);
    tg.passTo('main1').resolve();
    expect(tg.all('Treasure').length).toBe(1);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
  });
  it('sem criatura, não faz blight nem cria Tesouro', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Scuzzback Scrounger'], []], library: [['Island', 'Island'], ['Island']] });
    tg.passTo('draw');
    tg.run(sacrifice(tg.g, [tg.bf('Scuzzback Scrounger')]));
    tg.passTo('main2');
    expect(tg.all('Treasure').length).toBe(0);
  });
});
