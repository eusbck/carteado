import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Co-Option Adjutant', () => {
  it('criatura-artefato que causa dano de combate compra uma carta', () => {
    const tg = setup({ battlefield: [['Co-Option Adjutant', { name: 'Ornithopter', counters: { '+1/+1': 1 } }], []], library: [['Opt', 'Opt'], ['Opt']], step: 'main1' });
    tg.attack([['Ornithopter', 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
