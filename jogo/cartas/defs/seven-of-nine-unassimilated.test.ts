import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Seven of Nine, Unassimilated', () => {
  it('compra na primeira fase principal e descarta sem cinco terrenos de nomes diferentes', () => {
    const tg = setup({ battlefield: [['Seven of Nine, Unassimilated', 'Island'], []], hand: [['Forest'], []], library: [['Opt', 'Opt'], ['Opt']], step: 'upkeep' });
    tg.choose('descart', ['Forest']);
    tg.passTo('main1').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Opt']);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});
