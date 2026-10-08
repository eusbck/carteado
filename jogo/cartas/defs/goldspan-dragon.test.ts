import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

describe('Goldspan Dragon', () => {
  it('ao atacar, cria um Tesouro; Tesouros seus dão duas manas de uma cor', () => {
    const tg = setup({ battlefield: [['Goldspan Dragon'], []] });
    tg.attack([['Goldspan Dragon', 1]]).passTo('declareBlockers');
    const t = tg.bf('Treasure');
    const alts = manaOptions(tg.g, 0).filter((o) => o.obj === t).map((o) => o.alt.join(''));
    expect(alts).toContain('RR');
    expect(alts).toContain('G');
  });
  it('mirada pela mesma mágica, dispara uma vez; CR 603.3: o gatilho resolve antes da mágica', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Goldspan Dragon']], hand: [['Chaos Warp'], []] });
    tg.choose('permanente alvo', ['Goldspan Dragon']).cast('Chaos Warp');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.all('Treasure').length).toBe(1);
    expect(tg.find('Goldspan Dragon')).not.toBeNull();
  });
});
